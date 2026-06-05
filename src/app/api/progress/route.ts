import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Obsidian Vault base path on local system
const BASE_PATH = 'C:\\Users\\Ethan\\Desktop\\笔记\\docs\\八股准备基地';

// 6 Target Subdirectories
const TARGET_DIRS = [
  '1. Java 核心',
  '2. Spring 与 AOP',
  '3. Redis 与缓存',
  '4. MySQL 与数据库',
  '5. AI Agent 架构',
  '6. RAG 检索架构'
];

interface CardStats {
  title: string;
  category: string;
  grillCount: number;
  lastGrilled: string | null;
  score: number;
  filePath: string;
}

interface RadarData {
  category: string;
  score: number;
  totalCards: number;
  reviewedCards: number;
}

// Interview sprint decay formula (2-3 weeks): Max(0, BaseScore - (Today - last_grilled) * 15)
function calculateScore(grillCount: number, lastGrilled: string | null): number {
  if (grillCount === 0 || !lastGrilled) return 0;
  
  let baseScore = 0;
  if (grillCount === 1) baseScore = 40;
  else if (grillCount === 2) baseScore = 70;
  else if (grillCount >= 3) baseScore = 100;

  // Align dates ignoring time zones to prevent timezone discrepancy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastGrilledDate = new Date(lastGrilled);
  lastGrilledDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastGrilledDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  
  // Hard penalty for sprint: 15 points lost per unreviewed day (card expires in 3-5 days)
  const penalty = diffDays * 15;
  return Math.max(0, baseScore - penalty);
}

// Clean titles for robust fuzzy matching
function cleanString(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\|?\s*javaguide/gi, '')
    .replace(/(详解|专题|常见面试题总结|总结|基础|核心)/g, '')
    .replace(/[^\w\u4e00-\u9fa5]/g, '') // Keep words, digits, and chinese chars
    .trim()
    .toLowerCase();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isSync = searchParams.get('sync') === 'true';

    // Read cache file
    const cachePath = path.join(process.cwd(), 'docs', 'notebooklm_sources.json');
    let cacheData: Record<string, { id: string; title: string }[]> = {};
    
    if (fs.existsSync(cachePath)) {
      cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    }

    const allCards: CardStats[] = [];
    let totalCardsCount = 0;
    let reviewedCardsCount = 0;
    let completedCardsCount = 0; // grill_count >= 3
    let totalGrillSessions = 0; // total number of grills
    const grillDates = new Set<string>();

    const radarDataMap = new Map<string, { totalScore: number, cardCount: number, reviewedCount: number }>();
    TARGET_DIRS.forEach(dir => radarDataMap.set(dir, { totalScore: 0, cardCount: 0, reviewedCount: 0 }));

    if (fs.existsSync(BASE_PATH)) {
      const items = fs.readdirSync(BASE_PATH);
      
      for (const item of items) {
        if (TARGET_DIRS.includes(item)) {
          const dirPath = path.join(BASE_PATH, item);
          const stat = fs.statSync(dirPath);
          
          if (stat.isDirectory()) {
            const files = fs.readdirSync(dirPath);
            const localCards: {
              title: string;
              grillCount: number;
              lastGrilled: string | null;
              score: number;
              filePath: string;
              sourceId?: string;
              sourceTitle?: string;
              matched: boolean;
            }[] = [];

            // 1. Scan and parse all local cards in this directory
            for (const file of files) {
              const lowerFile = file.toLowerCase();
              if (
                file.endsWith('.md') &&
                file !== 'AGENTS.md' &&
                lowerFile !== 'index.md' &&
                lowerFile !== 'readme.md'
              ) {
                const filePath = path.join(dirPath, file);
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data } = matter(fileContent);
                const grillCount = parseInt(data.grill_count) || 0;
                const lastGrilled = data.last_grilled || null;
                const score = calculateScore(grillCount, lastGrilled);

                localCards.push({
                  title: file.replace('.md', ''),
                  grillCount,
                  lastGrilled,
                  score,
                  filePath,
                  sourceId: data.source_id || undefined,
                  sourceTitle: data.source_title || undefined,
                  matched: false
                });
              }
            }

            // 2. Fetch expected sources from NotebookLM cache for this folder
            const expectedSources = cacheData[item] || [];
            
            // 3. Match expected sources against local cards
            for (const source of expectedSources) {
              // Try to find a match in local cards
              let match = localCards.find(c => c.sourceId === source.id);
              
              if (!match) {
                // Fallback to fuzzy string matching
                const cleanSourceTitle = cleanString(source.title);
                match = localCards.find(c => {
                  if (c.matched) return false;
                  // If YAML has a sourceTitle check it, else check filename title
                  const cardTitleToMatch = c.sourceTitle || c.title;
                  const cleanCardTitle = cleanString(cardTitleToMatch);
                  return (
                    cleanCardTitle.includes(cleanSourceTitle) ||
                    cleanSourceTitle.includes(cleanCardTitle)
                  );
                });
              }

              if (match) {
                // Source is integrated locally
                match.matched = true;
                totalCardsCount++;
                
                const categoryStats = radarDataMap.get(item)!;
                categoryStats.cardCount++;
                totalGrillSessions += match.grillCount;
                
                if (match.grillCount > 0) {
                  reviewedCardsCount++;
                  categoryStats.reviewedCount++;
                }
                if (match.grillCount >= 3) {
                  completedCardsCount++;
                }
                if (match.lastGrilled) {
                  const dateString = new Date(match.lastGrilled).toISOString().split('T')[0];
                  grillDates.add(dateString);
                }

                categoryStats.totalScore += match.score;

                allCards.push({
                  title: match.title,
                  category: item.replace(/^\d+\.\s*/, ''),
                  grillCount: match.grillCount,
                  lastGrilled: match.lastGrilled,
                  score: match.score,
                  filePath: match.filePath
                });
              } else {
                // Source is NOT yet generated in local Obsidian
                totalCardsCount++;
                
                const categoryStats = radarDataMap.get(item)!;
                categoryStats.cardCount++;
                
                // Un-generated card stats (0 score, 0 grills, empty path)
                // Clean the title from artifacts like trailing | JavaGuide
                const cleanTitle = source.title
                  .replace(/[\r\n]+/g, ' ')
                  .replace(/\|?\s*javaguide/gi, '')
                  .trim();

                allCards.push({
                  title: cleanTitle,
                  category: item.replace(/^\d+\.\s*/, ''),
                  grillCount: 0,
                  lastGrilled: null,
                  score: 0,
                  filePath: '' // Empty string triggers WEAVE action in UI
                });
              }
            }

            // 4. Handle extra local cards that didn't match any expected sources (custom user cards)
            const unmatchedLocal = localCards.filter(c => !c.matched);
            for (const extraCard of unmatchedLocal) {
              totalCardsCount++;
              const categoryStats = radarDataMap.get(item)!;
              categoryStats.cardCount++;
              totalGrillSessions += extraCard.grillCount;

              if (extraCard.grillCount > 0) {
                reviewedCardsCount++;
                categoryStats.reviewedCount++;
              }
              if (extraCard.grillCount >= 3) {
                completedCardsCount++;
              }
              if (extraCard.lastGrilled) {
                const dateString = new Date(extraCard.lastGrilled).toISOString().split('T')[0];
                grillDates.add(dateString);
              }

              categoryStats.totalScore += extraCard.score;

              allCards.push({
                title: extraCard.title,
                category: item.replace(/^\d+\.\s*/, ''),
                grillCount: extraCard.grillCount,
                lastGrilled: extraCard.lastGrilled,
                score: extraCard.score,
                filePath: extraCard.filePath
              });
            }
          }
        }
      }
    } else {
      console.warn(`Base path not found: ${BASE_PATH}`);
    }

    // Calculate Streak based on unique sorted dates
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDates = Array.from(grillDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    if (sortedDates.length > 0) {
      let prevDate: Date | null = null;
      for (const dStr of sortedDates) {
        const d = new Date(dStr);
        if (prevDate === null) {
          currentStreak = 1;
        } else {
          const diff = (d.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
          if (diff <= 1.1) { // consecutive days (allowing 1.1 margin for date crossings)
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        }
        prevDate = d;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    // Process Radar Data
    const radarData: RadarData[] = TARGET_DIRS.map(dir => {
      const stats = radarDataMap.get(dir)!;
      const avgScore = stats.cardCount > 0 ? Math.round(stats.totalScore / stats.cardCount) : 0;
      const cleanCategory = dir.replace(/^\d+\.\s*/, '');
      return {
        category: cleanCategory,
        score: avgScore,
        totalCards: stats.cardCount,
        reviewedCards: stats.reviewedCount
      };
    });

    // Sort all cards by lowest score first for targeted study recommendations
    const recommendations = allCards
      .filter(card => card.filePath !== '') // Only recommend cards that exist locally
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        // Prioritize ungrilled cards
        if (!a.lastGrilled && b.lastGrilled) return -1;
        if (a.lastGrilled && !b.lastGrilled) return 1;
        // Prioritize older last_grilled date
        if (a.lastGrilled && b.lastGrilled) {
          return new Date(a.lastGrilled).getTime() - new Date(b.lastGrilled).getTime();
        }
        return 0;
      })
      .slice(0, 6); // returns up to 6 study recommendations

    return NextResponse.json({
      totalCards: totalCardsCount,
      reviewedCards: reviewedCardsCount,
      completedCards: completedCardsCount,
      totalGrills: totalGrillSessions,
      streak: maxStreak > 0 ? maxStreak : 0,
      radarData,
      recommendations,
      synced: isSync // Tell the frontend it processed the sync query parameter
    });
  } catch (error) {
    console.error("Error reading progress:", error);
    return NextResponse.json({ error: "Failed to read progress data" }, { status: 500 });
  }
}
