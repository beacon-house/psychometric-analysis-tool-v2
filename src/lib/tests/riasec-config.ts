// RIASEC Career Interest Test Configuration
// Contains all 48 questions with theme mapping based on Holland Occupational Themes model

export type RIASECTheme = 'Realistic' | 'Investigative' | 'Artistic' | 'Social' | 'Enterprising' | 'Conventional';

export interface QuestionRIASEC {
  id: number;
  text: string;
  theme: RIASECTheme;
}

export const questionsRIASEC: QuestionRIASEC[] = [
  { id: 1, text: 'Keep shipping and receiving records', theme: 'Realistic' },
  { id: 2, text: 'Teach children how to read', theme: 'Social' },
  { id: 3, text: 'Study animal behavior', theme: 'Investigative' },
  { id: 4, text: 'Teach an individual an exercise routine', theme: 'Social' },
  { id: 5, text: 'Use a computer program to generate customer bills', theme: 'Conventional' },
  { id: 6, text: 'Supervise the activities of children at a camp', theme: 'Social' },
  { id: 7, text: 'Lay brick or tile', theme: 'Realistic' },
  { id: 8, text: 'Inventory supplies using a hand-held computer', theme: 'Conventional' },
  { id: 9, text: 'Fix a broken faucet', theme: 'Realistic' },
  { id: 10, text: 'Install flooring in houses', theme: 'Realistic' },
  { id: 11, text: 'Make a map of the bottom of an ocean', theme: 'Investigative' },
  { id: 12, text: 'Write books or plays', theme: 'Artistic' },
  { id: 13, text: 'Test the quality of parts before shipment', theme: 'Conventional' },
  { id: 14, text: 'Conduct biological research', theme: 'Investigative' },
  { id: 15, text: 'Study whales and other types of marine life', theme: 'Investigative' },
  { id: 16, text: 'Compute and record statistical and other numerical data', theme: 'Conventional' },
  { id: 17, text: 'Manage the operations of a hotel', theme: 'Enterprising' },
  { id: 18, text: 'Play a musical instrument', theme: 'Artistic' },
  { id: 19, text: 'Work on an offshore oil-drilling rig', theme: 'Realistic' },
  { id: 20, text: 'Perform stunts for a movie or television show', theme: 'Artistic' },
  { id: 21, text: 'Operate a calculator', theme: 'Conventional' },
  { id: 22, text: 'Conduct a musical choir', theme: 'Artistic' },
  { id: 23, text: 'Sell merchandise at a department store', theme: 'Enterprising' },
  { id: 24, text: 'Generate the monthly payroll checks for an office', theme: 'Conventional' },
  { id: 25, text: 'Run a toy store', theme: 'Enterprising' },
  { id: 26, text: 'Sell houses', theme: 'Enterprising' },
  { id: 27, text: 'Work in a biology lab', theme: 'Investigative' },
  { id: 28, text: 'Study the structure of the human body', theme: 'Investigative' },
  { id: 29, text: 'Sell restaurant franchises to individuals', theme: 'Enterprising' },
  { id: 30, text: 'Help people who have problems with drugs or alcohol', theme: 'Social' },
  { id: 31, text: 'Handle customers\' bank transactions', theme: 'Conventional' },
  { id: 32, text: 'Assemble electronic parts', theme: 'Realistic' },
  { id: 33, text: 'Assemble products in a factory', theme: 'Realistic' },
  { id: 34, text: 'Write a song', theme: 'Artistic' },
  { id: 35, text: 'Manage a clothing store', theme: 'Enterprising' },
  { id: 36, text: 'Design sets for plays', theme: 'Artistic' },
  { id: 38, text: 'Help people with family-related problems', theme: 'Social' },
  { id: 39, text: 'Design artwork for magazines', theme: 'Artistic' },
  { id: 40, text: 'Develop a new medical treatment or procedure', theme: 'Investigative' },
  { id: 41, text: 'Manage a department within a large company', theme: 'Enterprising' },
  { id: 42, text: 'Help elderly people with their daily activities', theme: 'Social' },
  { id: 43, text: 'Give career guidance to people', theme: 'Social' },
  { id: 44, text: 'Do volunteer work at a non-profit organization', theme: 'Social' },
  { id: 45, text: 'Do research on plants or animals', theme: 'Investigative' },
  { id: 46, text: 'Operate a grinding machine in a factory', theme: 'Realistic' },
  { id: 47, text: 'Maintain employee records', theme: 'Conventional' },
  { id: 48, text: 'Direct a play', theme: 'Artistic' },
];

// Theme metadata for display and interpretation
export const themeMetadata: Record<RIASECTheme, { name: string; description: string; fullDescription: string }> = {
  Realistic: {
    name: 'Realistic',
    description: 'Practical, hands-on work with tools, machines, and concrete outcomes',
    fullDescription: 'Realistic individuals prefer working with things rather than people or ideas. They enjoy hands-on activities, working with tools, machines, and physical materials. Careers often involve construction, mechanics, engineering, agriculture, and technical trades.'
  },
  Investigative: {
    name: 'Investigative',
    description: 'Analytical, research-oriented work involving problem-solving and discovery',
    fullDescription: 'Investigative individuals are analytical thinkers who enjoy research and problem-solving. They prefer working with ideas, theories, and data. Careers often involve science, medicine, research, mathematics, and technology.'
  },
  Artistic: {
    name: 'Artistic',
    description: 'Creative expression through art, music, writing, and design',
    fullDescription: 'Artistic individuals are creative and expressive, preferring unstructured environments. They enjoy working with forms, designs, and patterns. Careers often involve arts, music, writing, design, and entertainment.'
  },
  Social: {
    name: 'Social',
    description: 'Helping others through teaching, counseling, caregiving, and mentoring',
    fullDescription: 'Social individuals are people-oriented and enjoy helping others. They prefer working in teams and providing service. Careers often involve teaching, counseling, healthcare, social work, and community service.'
  },
  Enterprising: {
    name: 'Enterprising',
    description: 'Leading, persuading, and managing people and businesses',
    fullDescription: 'Enterprising individuals are persuasive leaders who enjoy business and management. They prefer taking initiative and influencing others. Careers often involve sales, management, entrepreneurship, law, and politics.'
  },
  Conventional: {
    name: 'Conventional',
    description: 'Organized, detail-oriented administrative and clerical work',
    fullDescription: 'Conventional individuals are detail-oriented and organized. They prefer structured environments with clear rules. Careers often involve administration, accounting, data management, banking, and office work.'
  }
};

// Response scale for RIASEC (like/dislike scale)
export const responseScale = [
  { value: 1, label: 'Strongly Dislike', shortLabel: 'Strongly Dislike' },
  { value: 2, label: 'Dislike', shortLabel: 'Dislike' },
  { value: 3, label: 'Neutral', shortLabel: 'Neutral' },
  { value: 4, label: 'Like', shortLabel: 'Like' },
  { value: 5, label: 'Strongly Like', shortLabel: 'Strongly Like' },
];
