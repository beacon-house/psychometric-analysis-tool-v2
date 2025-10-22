// Big Five (OCEAN) Personality Test Configuration
// Contains all 50 questions with trait mapping and keying direction

export interface QuestionBig5 {
  id: number;
  text: string;
  trait: 'O' | 'C' | 'E' | 'A' | 'ES';
  keying: 'positive' | 'negative';
}

export const questionsBigFive: QuestionBig5[] = [
  { id: 1, text: 'Am the life of the party.', trait: 'E', keying: 'positive' },
  { id: 2, text: 'Feel little concern for others.', trait: 'A', keying: 'negative' },
  { id: 3, text: 'Am always prepared.', trait: 'C', keying: 'positive' },
  { id: 4, text: 'Get stressed out easily.', trait: 'ES', keying: 'negative' },
  { id: 5, text: 'Have a rich vocabulary.', trait: 'O', keying: 'positive' },
  { id: 6, text: "Don't talk a lot.", trait: 'E', keying: 'negative' },
  { id: 7, text: 'Am interested in people.', trait: 'A', keying: 'positive' },
  { id: 8, text: 'Leave my belongings around.', trait: 'C', keying: 'negative' },
  { id: 9, text: 'Am relaxed most of the time.', trait: 'ES', keying: 'positive' },
  { id: 10, text: 'Have difficulty understanding abstract ideas.', trait: 'O', keying: 'negative' },
  { id: 11, text: 'Feel comfortable around people.', trait: 'E', keying: 'positive' },
  { id: 12, text: 'Insult people.', trait: 'A', keying: 'negative' },
  { id: 13, text: 'Pay attention to details.', trait: 'C', keying: 'positive' },
  { id: 14, text: 'Worry about things.', trait: 'ES', keying: 'negative' },
  { id: 15, text: 'Have a vivid imagination.', trait: 'O', keying: 'positive' },
  { id: 16, text: 'Keep in the background.', trait: 'E', keying: 'negative' },
  { id: 17, text: "Sympathize with others' feelings.", trait: 'A', keying: 'positive' },
  { id: 18, text: 'Make a mess of things.', trait: 'C', keying: 'negative' },
  { id: 19, text: 'Seldom feel blue.', trait: 'ES', keying: 'positive' },
  { id: 20, text: 'Am not interested in abstract ideas.', trait: 'O', keying: 'negative' },
  { id: 21, text: 'Start conversations.', trait: 'E', keying: 'positive' },
  { id: 22, text: "Am not interested in other people's problems.", trait: 'A', keying: 'negative' },
  { id: 23, text: 'Get chores done right away.', trait: 'C', keying: 'positive' },
  { id: 24, text: 'Am easily disturbed.', trait: 'ES', keying: 'negative' },
  { id: 25, text: 'Have excellent ideas.', trait: 'O', keying: 'positive' },
  { id: 26, text: 'Have little to say.', trait: 'E', keying: 'negative' },
  { id: 27, text: 'Have a soft heart.', trait: 'A', keying: 'positive' },
  { id: 28, text: 'Often forget to put things back in their proper place.', trait: 'C', keying: 'negative' },
  { id: 29, text: 'Get upset easily.', trait: 'ES', keying: 'negative' },
  { id: 30, text: 'Do not have a good imagination.', trait: 'O', keying: 'negative' },
  { id: 31, text: 'Talk to a lot of different people at parties.', trait: 'E', keying: 'positive' },
  { id: 32, text: 'Am not really interested in others.', trait: 'A', keying: 'negative' },
  { id: 33, text: 'Like order.', trait: 'C', keying: 'positive' },
  { id: 34, text: 'Change my mood a lot.', trait: 'ES', keying: 'negative' },
  { id: 35, text: 'Am quick to understand things.', trait: 'O', keying: 'positive' },
  { id: 36, text: "Don't like to draw attention to myself.", trait: 'E', keying: 'negative' },
  { id: 37, text: 'Take time out for others.', trait: 'A', keying: 'positive' },
  { id: 38, text: 'Shirk my duties.', trait: 'C', keying: 'negative' },
  { id: 39, text: 'Have frequent mood swings.', trait: 'ES', keying: 'negative' },
  { id: 40, text: 'Use difficult words.', trait: 'O', keying: 'positive' },
  { id: 41, text: "Don't mind being the center of attention.", trait: 'E', keying: 'positive' },
  { id: 42, text: "Feel others' emotions.", trait: 'A', keying: 'positive' },
  { id: 43, text: 'Follow a schedule.', trait: 'C', keying: 'positive' },
  { id: 44, text: 'Get irritated easily.', trait: 'ES', keying: 'negative' },
  { id: 45, text: 'Spend time reflecting on things.', trait: 'O', keying: 'positive' },
  { id: 46, text: 'Am quiet around strangers.', trait: 'E', keying: 'negative' },
  { id: 47, text: 'Make people feel at ease.', trait: 'A', keying: 'positive' },
  { id: 48, text: 'Am exacting in my work.', trait: 'C', keying: 'positive' },
  { id: 49, text: 'Often feel blue.', trait: 'ES', keying: 'negative' },
  { id: 50, text: 'Am full of ideas.', trait: 'O', keying: 'positive' },
];

// Trait metadata for display and interpretation
export const traitMetadata = {
  O: {
    name: 'Openness to Experience',
    shortName: 'Openness',
    description: 'Intellectual curiosity, creativity, and appreciation for new experiences',
  },
  C: {
    name: 'Conscientiousness',
    shortName: 'Conscientiousness',
    description: 'Organization, responsibility, and goal-oriented behavior',
  },
  E: {
    name: 'Extraversion',
    shortName: 'Extraversion',
    description: 'Sociability, assertiveness, and energy from external stimulation',
  },
  A: {
    name: 'Agreeableness',
    shortName: 'Agreeableness',
    description: 'Compassion, cooperation, and trust in others',
  },
  ES: {
    name: 'Emotional Stability',
    shortName: 'Emotional Stability',
    description: 'Calmness, resilience, and emotional regulation',
  },
};

// Response scale labels
export const responseScaleBig5 = [
  { value: 1, label: 'Very Inaccurate', shortLabel: 'Very Inaccurate' },
  { value: 2, label: 'Moderately Inaccurate', shortLabel: 'Mod. Inaccurate' },
  { value: 3, label: 'Neither Accurate nor Inaccurate', shortLabel: 'Neutral' },
  { value: 4, label: 'Moderately Accurate', shortLabel: 'Mod. Accurate' },
  { value: 5, label: 'Very Accurate', shortLabel: 'Very Accurate' },
];

// Trait descriptions for interpretation
export const traitDescriptions = {
  O: {
    veryHigh: 'Highly creative, curious, and open-minded. Enjoys learning new things, exploring ideas, and appreciating art and beauty. Comfortable with ambiguity and abstract concepts.',
    high: 'Creative and curious with a strong appreciation for new experiences. Enjoys intellectual challenges and exploring unconventional perspectives.',
    moderate: 'Balanced between creativity and practicality. Open to new ideas while maintaining some preference for routine and familiar approaches.',
    low: 'Practical and conventional with a preference for routine. Focuses on concrete facts rather than abstract theories. More conservative in thinking.',
    veryLow: 'Strongly prefers routine and conventional approaches. Focuses on practical, tried-and-true methods rather than exploring new ideas or abstract concepts.',
  },
  C: {
    veryHigh: 'Highly organized, responsible, and disciplined. Strong tendency to be goal-oriented, detail-focused, and committed to completing tasks thoroughly and on time.',
    high: 'Organized and responsible with strong planning abilities. Follows through on commitments and pays attention to details.',
    moderate: 'Balanced between organization and flexibility. Generally responsible while maintaining some spontaneity and adaptability.',
    low: 'More spontaneous and flexible with a casual approach to organization. Adapts quickly to changing circumstances and comfortable with some disorder.',
    veryLow: 'Very spontaneous and casual about organization. Strongly prefers flexibility over planning and structure. May struggle with long-term goal pursuit.',
  },
  E: {
    veryHigh: 'Highly outgoing, energetic, and sociable. Strongly draws energy from interactions with others. Very comfortable being the center of attention.',
    high: 'Energized by social interactions and external activities. Comfortable in groups, enjoys being active in conversations, and seeks out social stimulation.',
    moderate: 'Balanced between social engagement and solitude. Enjoys social activities while also valuing alone time for reflection and recharging.',
    low: 'Reserved and quiet with a preference for solitude or small groups. Draws energy from alone time and prefers listening to speaking.',
    veryLow: 'Strongly introverted with a clear preference for solitude. Finds large social gatherings draining and strongly prefers independent activities.',
  },
  A: {
    veryHigh: 'Highly compassionate, cooperative, and trusting. Strong value for harmony and helping others. Very empathetic and considerate of others\' needs.',
    high: 'Compassionate and cooperative with a strong tendency to trust others. Values harmony in relationships and shows genuine concern for others\' wellbeing.',
    moderate: 'Balanced between cooperation and assertiveness. Generally considerate while maintaining ability to prioritize own needs and challenge others when necessary.',
    low: 'More skeptical and competitive with direct communication style. Prioritizes truth over tact and more self-focused in decision making.',
    veryLow: 'Highly skeptical and competitive. Strongly prioritizes own interests and challenges others readily. Very direct and less concerned with maintaining harmony.',
  },
  ES: {
    veryHigh: 'Highly calm, even-tempered, and resilient. Handles stress exceptionally well and maintains strong emotional equilibrium even in challenging situations.',
    high: 'Calm and resilient with good stress management. Handles challenges well and recovers quickly from setbacks.',
    moderate: 'Generally maintains emotional balance with occasional reactivity to stress. Experiences normal mood fluctuations but typically manages emotions reasonably well.',
    low: 'More reactive to stress and sensitive to setbacks. Experiences mood fluctuations and may worry more frequently about potential problems.',
    veryLow: 'Highly reactive to stress and anxiety. Experiences frequent mood swings and strong emotional responses. Very sensitive to criticism and setbacks.',
  },
};
