// 16 Personalities Test Configuration
// Contains all 32 questions with dimension mapping and keying direction

export interface Question16P {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP' | 'AT';
  keying: 'forward' | 'reverse';
}

export const questions16Personalities: Question16P[] = [
  { id: 1, text: 'You tend to seek out social interaction and enjoy being the center of attention.', dimension: 'EI', keying: 'forward' },
  { id: 2, text: 'You prefer to focus on the big picture rather than getting caught up in details.', dimension: 'SN', keying: 'reverse' },
  { id: 3, text: 'You make decisions based primarily on objective logic and factual analysis.', dimension: 'TF', keying: 'forward' },
  { id: 4, text: 'You enjoy planning and organizing activities well in advance.', dimension: 'JP', keying: 'forward' },
  { id: 5, text: 'You tend to question yourself and worry about things that might go wrong.', dimension: 'AT', keying: 'reverse' },
  { id: 6, text: 'You prefer to spend time alone rather than in large groups.', dimension: 'EI', keying: 'reverse' },
  { id: 7, text: 'You are more comfortable following established procedures than trying new approaches.', dimension: 'SN', keying: 'forward' },
  { id: 8, text: 'You base your decisions on how actions will affect people\'s feelings.', dimension: 'TF', keying: 'reverse' },
  { id: 9, text: 'You prefer to keep your options open rather than commit to a plan.', dimension: 'JP', keying: 'reverse' },
  { id: 10, text: 'You feel confident in yourself and rarely doubt your decisions.', dimension: 'AT', keying: 'forward' },
  { id: 11, text: 'You find it easy to connect with others and build relationships quickly.', dimension: 'EI', keying: 'forward' },
  { id: 12, text: 'You tend to think about abstract concepts and future possibilities.', dimension: 'SN', keying: 'reverse' },
  { id: 13, text: 'You are primarily motivated by helping others and serving their needs.', dimension: 'TF', keying: 'reverse' },
  { id: 14, text: 'You like to have everything organized and scheduled.', dimension: 'JP', keying: 'forward' },
  { id: 15, text: 'You often feel anxious about your performance and abilities.', dimension: 'AT', keying: 'reverse' },
  { id: 16, text: 'You prefer quiet environments where you can focus on your thoughts.', dimension: 'EI', keying: 'reverse' },
  { id: 17, text: 'You enjoy working with concrete facts and practical information.', dimension: 'SN', keying: 'forward' },
  { id: 18, text: 'You are quick to spot inconsistencies in arguments or information.', dimension: 'TF', keying: 'forward' },
  { id: 19, text: 'You like to start projects but sometimes struggle to finish them.', dimension: 'JP', keying: 'reverse' },
  { id: 20, text: 'You believe you can succeed in most situations you face.', dimension: 'AT', keying: 'forward' },
  { id: 21, text: 'You find large social gatherings energizing and enjoyable.', dimension: 'EI', keying: 'forward' },
  { id: 22, text: 'You prefer to develop ideas through discussion and interaction.', dimension: 'SN', keying: 'reverse' },
  { id: 23, text: 'You prioritize maintaining harmony and avoiding conflict.', dimension: 'TF', keying: 'reverse' },
  { id: 24, text: 'You prefer structure and having clear expectations about what to do.', dimension: 'JP', keying: 'forward' },
  { id: 25, text: 'You often worry about things outside your control.', dimension: 'AT', keying: 'reverse' },
  { id: 26, text: 'You need significant time alone to recharge after social activities.', dimension: 'EI', keying: 'reverse' },
  { id: 27, text: 'You tend to remember specific facts and experiences in detail.', dimension: 'SN', keying: 'forward' },
  { id: 28, text: 'You are more interested in how something could work than how it currently works.', dimension: 'SN', keying: 'reverse' },
  { id: 29, text: 'You make choices based on what feels right rather than logical analysis.', dimension: 'TF', keying: 'reverse' },
  { id: 30, text: 'You prefer having a solid plan before starting something important.', dimension: 'JP', keying: 'forward' },
  { id: 31, text: 'You tend to be confident about your future prospects.', dimension: 'AT', keying: 'forward' },
  { id: 32, text: 'You enjoy meeting new people and making new friends regularly.', dimension: 'EI', keying: 'forward' },
];

// Dimension metadata for display and interpretation
export const dimensionMetadata = {
  EI: {
    name: 'Extraversion vs Introversion',
    dominant: { code: 'E', label: 'Extravert', description: 'Draws energy from social interactions and tends to be outwardly focused and action-oriented' },
    recessive: { code: 'I', label: 'Introvert', description: 'Draws energy from solitude and reflection, tends to be inwardly focused and thoughtful' },
  },
  SN: {
    name: 'Intuitive vs Observant',
    dominant: { code: 'N', label: 'Intuitive', description: 'Prefers abstract concepts and future possibilities over concrete details and immediate reality' },
    recessive: { code: 'S', label: 'Observant', description: 'Prefers concrete facts and practical information, focused on present reality' },
  },
  TF: {
    name: 'Thinking vs Feeling',
    dominant: { code: 'T', label: 'Thinking', description: 'Makes decisions based on objective logic and consistency rather than personal values or impact on others' },
    recessive: { code: 'F', label: 'Feeling', description: 'Makes decisions based on personal values and consideration of impact on others' },
  },
  JP: {
    name: 'Judging vs Perceiving',
    dominant: { code: 'J', label: 'Judging', description: 'Prefers structure, organization, and planning; likes to have things decided and settled' },
    recessive: { code: 'P', label: 'Perceiving', description: 'Prefers flexibility and spontaneity; likes to keep options open' },
  },
  AT: {
    name: 'Assertive vs Turbulent',
    dominant: { code: 'A', label: 'Assertive', description: 'Self-assured and stress-resistant; confident in abilities and less affected by criticism' },
    recessive: { code: 'T', label: 'Turbulent', description: 'Self-conscious and perfectionist; questions own abilities and is motivated to improve' },
  },
};

// Response scale labels
export const responseScale = [
  { value: 1, label: 'Strongly Disagree', shortLabel: 'Strongly Disagree' },
  { value: 2, label: 'Disagree', shortLabel: 'Disagree' },
  { value: 3, label: 'Neutral', shortLabel: 'Neutral' },
  { value: 4, label: 'Agree', shortLabel: 'Agree' },
  { value: 5, label: 'Strongly Agree', shortLabel: 'Strongly Agree' },
];
