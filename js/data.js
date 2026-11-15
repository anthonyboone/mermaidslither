export const COLS = 22;
export const ROWS = 26;
export const MODES = {
  classic: { name: 'Classic Snake Run', short: 'Classic', tag: 'THE ORIGINAL', icon: 'wave', color: '#7de9cc', description: 'A sea of pearls. How long can you grow?', goal: 'Collect pearls. Avoid walls and your tail.' },
  time: { name: 'Time Twist', short: 'Time Twist', tag: '60-SECOND SPLASH', icon: 'clock', color: '#ffbc9c', description: 'One minute. Make every pearl count.', goal: '60 seconds! Crashes cost 30 points, not the round.' },
  speed: { name: 'Speedy Star', short: 'Speedy Star', tag: 'PICK UP THE PACE', icon: 'star', color: '#d1b5ff', description: 'Catch a current. Chase your best.', goal: 'Speed increases every 10 seconds. Stay in the swim!' },
  maze: { name: 'Candy Coral Maze', short: 'Coral Maze', tag: '8 REEFS TO EXPLORE', icon: 'coral', color: '#ffb6d2', description: 'Little twists. Big discoveries.', goal: 'Find the pearls and finish the reef. Coral is a wall!' },
};
export const DIFFICULTIES = {
  chill: { name: 'Chill', start: 205, min: 140, description: 'Easy currents + a starting shield' },
  adventure: { name: 'Adventure', start: 155, min: 90, description: 'A little challenge, a lot of fun' },
  turbo: { name: 'Turbo', start: 120, min: 65, description: 'For quick fins and brave turns' },
};
export const SKINS = [
  { id: 'lagoon', name: 'Lagoon Dream', colors: ['#b4ffe3', '#38cbb2'], cost: 60, starter: true },
  { id: 'rose', name: 'Coral Kiss', colors: ['#ffd1e3', '#ee7dac'], cost: 60, starter: true },
  { id: 'lilac', name: 'Lilac Tide', colors: ['#e9d5ff', '#ac8de8'], cost: 60, starter: true },
  { id: 'sunny', name: 'Sunbeam', colors: ['#ffecab', '#f0b658'], cost: 60, starter: true },
  { id: 'blue', name: 'Blue Lagoon', colors: ['#bcf0ff', '#66b5ed'], cost: 60, starter: true },
  { id: 'peach', name: 'Peach Pearl', colors: ['#ffe0c4', '#f4a084'], cost: 60, starter: true },
  { id: 'moon', name: 'Moon Jelly', colors: ['#f1eeff', '#a9b5f2'], cost: 100 },
  { id: 'kelp', name: 'Sea Glass', colors: ['#d2f6b5', '#70c68c'], cost: 100 },
  { id: 'berry', name: 'Berry Reef', colors: ['#f5b8ff', '#cb6ada'], cost: 120 },
  { id: 'ember', name: 'Sunset Swim', colors: ['#ffdc98', '#f0817f'], cost: 120 },
  { id: 'deep', name: 'Midnight Magic', colors: ['#a7b8ff', '#706fce'], cost: 150 },
  { id: 'pearl', name: 'Pearl Princess', colors: ['#fff7e3', '#e8b6cf'], cost: 180 },
];
export const BUDDIES = [
  { id: 'turtle', name: 'Clover', type: 'Baby turtle', color: '#8de3bb', line: 'One pearl at a time. You’ve got this!' },
  { id: 'cat', name: 'Mochi', type: 'Sea kitten', color: '#d4b9f4', line: 'A little curious. A little courageous. Like you!' },
  { id: 'dolphin', name: 'Skipper', type: 'Tiny dolphin', color: '#9ddcf4', line: 'Ready to make a splash?' },
];
export const POWERS = {
  shield: { name: 'Bubble Shield', symbol: '◇', color: '#93ddff', duration: 0 },
  slow: { name: 'Slow Current', symbol: '❄', color: '#b2e8ff', duration: 6 },
  magnet: { name: 'Pearl Magnet', symbol: 'U', color: '#ffa9cd', duration: 8 },
  double: { name: 'Double Treasure', symbol: '×2', color: '#ffe394', duration: 8 },
};

// Rectangles are [x, y, width, height]; the starting row (19) stays clear.
export const MAZES = [
  { name: 'Sugar Shallows', target: 8, time: 85, perfect: 60, rects: [[5,6,4,1],[13,6,4,1],[5,13,4,1],[13,13,4,1]] },
  { name: 'Jellybean Garden', target: 10, time: 105, perfect: 75, rects: [[5,4,1,9],[16,4,1,9],[9,8,4,1],[9,15,4,1],[5,22,12,1]] },
  { name: 'Peppermint Pass', target: 12, time: 125, perfect: 90, rects: [[3,5,12,1],[7,10,12,1],[3,15,12,1],[7,23,12,1]] },
  { name: 'Marshmallow Cove', target: 12, time: 125, perfect: 90, rects: [[4,4,4,3],[14,4,4,3],[9,11,4,3],[3,22,4,2],[15,22,4,2]] },
  { name: 'Rainbow Ribbon', target: 14, time: 145, perfect: 105, rects: [[4,3,1,11],[10,7,1,10],[17,3,1,11],[4,22,14,1]] },
  { name: 'Lollipop Lagoon', target: 15, time: 155, perfect: 110, rects: [[4,4,4,2],[14,4,4,2],[6,6,1,6],[15,6,1,6],[9,14,4,2],[3,22,5,1],[14,22,5,1]] },
  { name: 'Crystal Current', target: 16, time: 165, perfect: 120, rects: [[3,4,6,1],[13,4,6,1],[6,8,1,7],[15,8,1,7],[9,11,4,1],[3,22,6,1],[13,22,6,1]] },
  { name: 'The Pearl Palace', target: 18, time: 185, perfect: 135, rects: [[3,3,1,12],[18,3,1,12],[7,6,8,1],[7,6,1,8],[14,6,1,8],[9,11,3,1],[4,22,5,1],[13,22,5,1]] },
];
export function wallsFor(stage) {
  const cells = (MAZES[stage]?.rects || []).flatMap(([x,y,w,h]) => Array.from({ length: w*h }, (_,i) => ({ x: x+i%w, y: y+Math.floor(i/w) })));
  return [...new Map(cells.map(p=>[`${p.x},${p.y}`,p])).values()];
}
export const ACHIEVEMENTS = [
  { id: 'first', name: 'First Splash', description: 'Finish your first swim', reward: 15, test: (s) => s.totals.runs >= 1 },
  { id: 'pearls25', name: 'Pearl Finder', description: 'Collect 25 pearls in total', reward: 20, test: (s) => s.totals.food >= 25 },
  { id: 'pearls100', name: 'Ocean Treasure', description: 'Collect 100 pearls in total', reward: 40, test: (s) => s.totals.food >= 100 },
  { id: 'score100', name: 'Making Waves', description: 'Score 100 in one swim', reward: 20, test: (_,r) => r.score >= 100 },
  { id: 'score500', name: 'Big Splash', description: 'Score 500 in one swim', reward: 40, test: (_,r) => r.score >= 500 },
  { id: 'long', name: 'Lovely Longtail', description: 'Reach a length of 20', reward: 30, test: (_,r) => r.maxLength >= 20 },
  { id: 'gold', name: 'Golden Fin', description: 'Collect a golden pearl', reward: 15, test: (_,r) => r.gold >= 1 },
  { id: 'party', name: 'Party in the Reef', description: 'Start a Pearl Party', reward: 25, test: (_,r) => r.parties >= 1 },
  { id: 'time', name: 'Minute Mermaid', description: 'Finish a Time Twist round', reward: 25, test: (_,r) => r.mode === 'time' && r.elapsed >= 59.9 },
  { id: 'speed', name: 'Current Catcher', description: 'Survive 30 seconds in Speedy Star', reward: 30, test: (_,r) => r.mode === 'speed' && r.elapsed >= 30 },
  { id: 'maze', name: 'Coral Explorer', description: 'Complete a maze', reward: 25, test: (_,r) => r.mode === 'maze' && r.won },
  { id: 'explorer', name: 'Every Kind of Magic', description: 'Try all four modes', reward: 40, test: (s) => s.totals.modes.length === 4 },
];
export const MISSION_TYPES = [
  { id: 'food', name: 'Pearl picnic', description: 'Collect 12 pearls', target: 12, reward: 20, progress: r => r.food },
  { id: 'score', name: 'Make some waves', description: 'Earn 300 points', target: 300, reward: 25, progress: r => r.score },
  { id: 'runs', name: 'Just keep swimming', description: 'Play 3 swims', target: 3, reward: 20, progress: () => 1 },
  { id: 'gold', name: 'A golden little day', description: 'Find 3 golden pearls', target: 3, reward: 25, progress: r => r.gold },
  { id: 'time', name: 'Take your time', description: 'Swim for 120 seconds total', target: 120, reward: 25, progress: r => Math.floor(r.elapsed) },
  { id: 'power', name: 'A touch of magic', description: 'Pick up 3 power-ups', target: 3, reward: 25, progress: r => r.powers },
];
