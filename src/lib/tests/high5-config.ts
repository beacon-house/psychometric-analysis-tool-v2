// HIGH5 Strengths Test Configuration
// Contains all 120 questions with strength mapping and metadata for 20 strengths across 4 domains

export type StrengthName =
  | 'Believer'
  | 'Deliverer'
  | 'Focus Expert'
  | 'Problem Solver'
  | 'Time Keeper'
  | 'Chameleon'
  | 'Coach'
  | 'Empathizer'
  | 'Optimist'
  | 'Peace Keeper'
  | 'Catalyst'
  | 'Commander'
  | 'Self-Believer'
  | 'Storyteller'
  | 'Winner'
  | 'Analyst'
  | 'Brainstormer'
  | 'Philomath'
  | 'Strategist'
  | 'Thinker';

export type DomainName = 'Doing' | 'Feeling' | 'Motivating' | 'Thinking';

export interface QuestionHigh5 {
  id: number;
  text: string;
  strength: StrengthName;
}

export interface StrengthMetadata {
  name: StrengthName;
  domain: DomainName;
  coreCharacteristic: string;
  energizedBy: string;
  drainedBy: string;
  shortDescription: string;
}

export interface DomainMetadata {
  name: DomainName;
  description: string;
  orientation: string;
}

export const questionsHigh5: QuestionHigh5[] = [
  { id: 1, text: 'I believe that no matter what happens to me I will inevitably bounce back', strength: 'Self-Believer' },
  { id: 2, text: 'I am energized when I help someone experience success', strength: 'Coach' },
  { id: 3, text: 'I am excited every time I act spontaneously', strength: 'Chameleon' },
  { id: 4, text: 'I believe in lifelong learning', strength: 'Philomath' },
  { id: 5, text: 'I love taking control of situations that seem to be out of control', strength: 'Commander' },
  { id: 6, text: 'I am energized every time I cross another item off my to-do list', strength: 'Deliverer' },
  { id: 7, text: 'I love taking necessary risks', strength: 'Catalyst' },
  { id: 8, text: 'I am excited when I get people to sacrifice their egos for the benefit of the group', strength: 'Peace Keeper' },
  { id: 9, text: 'I believe the time is too precious to be wasted by being disorganized', strength: 'Time Keeper' },
  { id: 10, text: 'I get a jolt of energy when I get to act altruistically', strength: 'Believer' },
  { id: 11, text: 'I enjoy my time alone when I can muse and reflect undisturbed', strength: 'Thinker' },
  { id: 12, text: 'The freedom to express all of my emotions from laughing to crying is important to me', strength: 'Optimist' },
  { id: 13, text: 'I naturally see patterns where others see complexity', strength: 'Analyst' },
  { id: 14, text: 'I believe that everyone needs a coach in their life', strength: 'Coach' },
  { id: 15, text: 'I naturally take mental ownership and responsibility for even the smallest things I commit to', strength: 'Deliverer' },
  { id: 16, text: 'I love restoring things and bringing them back to life', strength: 'Problem Solver' },
  { id: 17, text: 'I am energized when I get to speak in front of the audience', strength: 'Storyteller' },
  { id: 18, text: 'I am thrilled every time I get to compete with others', strength: 'Winner' },
  { id: 19, text: 'It is important for me to collect as much data as possible to make an informed decision', strength: 'Analyst' },
  { id: 20, text: 'It is natural for me to look for common ground among people', strength: 'Peace Keeper' },
  { id: 21, text: 'I am excited every time I get to turn a new idea into action', strength: 'Catalyst' },
  { id: 22, text: 'I believe it is important to tell the truth to others, even if this truth is bitter', strength: 'Commander' },
  { id: 23, text: 'I love connecting dots that seemingly have nothing in common', strength: 'Brainstormer' },
  { id: 24, text: 'I enjoy challenging people to prove their points of view', strength: 'Winner' },
  { id: 25, text: 'I value flexibility today more than long-term commitments', strength: 'Chameleon' },
  { id: 26, text: 'I am thrilled to celebrate even the smallest of achievements', strength: 'Optimist' },
  { id: 27, text: 'It is natural for me to get lost in thoughts', strength: 'Thinker' },
  { id: 28, text: "I believe if you can't do it right, don't do it", strength: 'Focus Expert' },
  { id: 29, text: "I enjoy putting myself into other people's shoes to understand what they are going through", strength: 'Empathizer' },
  { id: 30, text: "It is natural for me to figure out what's wrong and find solutions to it", strength: 'Problem Solver' },
  { id: 31, text: 'I believe there is more of what unites people rather than what divides them', strength: 'Peace Keeper' },
  { id: 32, text: 'I believe there is always more than one way to reach the same goal', strength: 'Brainstormer' },
  { id: 33, text: 'I enjoy setting goals and defining priorities to achieve them', strength: 'Strategist' },
  { id: 34, text: 'I believe the gold medal is the only medal to aim for', strength: 'Winner' },
  { id: 35, text: 'It is important for me to have no limits to creative expression', strength: 'Brainstormer' },
  { id: 36, text: 'I believe there are no conditions under which personal values can be sacrificed', strength: 'Believer' },
  { id: 37, text: 'I love turning clutter and chaos into order and structure', strength: 'Time Keeper' },
  { id: 38, text: 'I believe the best way of learning is by doing', strength: 'Catalyst' },
  { id: 39, text: 'I believe no problems resolve by themselves', strength: 'Problem Solver' },
  { id: 40, text: 'I enjoy thinking about "what if" scenarios', strength: 'Strategist' },
  { id: 41, text: 'Delivering upon what I promised gives me a great dose of satisfaction', strength: 'Deliverer' },
  { id: 42, text: 'I believe multitasking is ineffective for achieving meaningful results', strength: 'Focus Expert' },
  { id: 43, text: 'I believe that work not only can but also should be fun', strength: 'Optimist' },
  { id: 44, text: "It is natural for me to be genuinely interested in other people's growth", strength: 'Coach' },
  { id: 45, text: 'I am good at staying objective and logical when dealing with emotional issues', strength: 'Analyst' },
  { id: 46, text: 'I am energized by mental activity', strength: 'Thinker' },
  { id: 47, text: 'I am excited every time I get to follow my natural curiosity', strength: 'Philomath' },
  { id: 48, text: 'I feel excited when I manage to build a bridge between people with diverging opinions', strength: 'Peace Keeper' },
  { id: 49, text: 'It is natural for me to trust myself, my strengths, and my instinct in any situation', strength: 'Self-Believer' },
  { id: 50, text: "It's natural for me to find the positive in every situation", strength: 'Optimist' },
  { id: 51, text: 'I get excited convincing others just for the sake of winning the argument', strength: 'Winner' },
  { id: 52, text: 'I believe life happens one day at a time, there is no need to plan it', strength: 'Chameleon' },
  { id: 53, text: "It's natural for me to sense the feelings of people around me", strength: 'Empathizer' },
  { id: 54, text: 'I get excited when analyzing & dealing with numbers', strength: 'Analyst' },
  { id: 55, text: 'It is natural for me to come up with a million new ideas a day', strength: 'Brainstormer' },
  { id: 56, text: 'It is natural for me to quickly adjust to changing circumstances', strength: 'Chameleon' },
  { id: 57, text: 'I naturally find a sense of greater purpose in everything that I do', strength: 'Believer' },
  { id: 58, text: 'I love getting things done by doing one thing at a time', strength: 'Focus Expert' },
  { id: 59, text: 'I feel excited when I find a solution to a problem others cannot solve', strength: 'Problem Solver' },
  { id: 60, text: 'It is natural for me to voice my opinion, even if it is contrary to others', strength: 'Commander' },
  { id: 61, text: 'I am energized by stimulating other people to go a step further', strength: 'Coach' },
  { id: 62, text: 'I enjoy following a specific step-by-step plan to get things done on time', strength: 'Time Keeper' },
  { id: 63, text: 'I believe how you present is more important than what you present', strength: 'Storyteller' },
  { id: 64, text: 'I get energized every time I anticipate the needs of others without them saying a word', strength: 'Empathizer' },
  { id: 65, text: 'I am energized by thinking outside of the box', strength: 'Brainstormer' },
  { id: 66, text: 'I learn new things faster than others', strength: 'Philomath' },
  { id: 67, text: 'I believe that competition is the best driver for achieving excellence', strength: 'Winner' },
  { id: 68, text: 'It is natural for me to keep myself & others on task and on point', strength: 'Time Keeper' },
  { id: 69, text: "I believe that following through with commitments defines a person's reputation", strength: 'Deliverer' },
  { id: 70, text: 'It is natural for me to energize people to act', strength: 'Catalyst' },
  { id: 71, text: 'It is natural for me to set up routines, schedules, timelines, and deadlines', strength: 'Time Keeper' },
  { id: 72, text: 'I believe everyone should help each other to reach their full potential', strength: 'Coach' },
  { id: 73, text: 'I feel excited every time I am in charge', strength: 'Commander' },
  { id: 74, text: 'I enjoy thinking of all alternative ways to find the best route', strength: 'Strategist' },
  { id: 75, text: 'I believe the best way to achieve success is by focusing on one thing', strength: 'Focus Expert' },
  { id: 76, text: 'I believe a great idea is more important than its execution', strength: 'Brainstormer' },
  { id: 77, text: 'I believe theory should always precede practice', strength: 'Strategist' },
  { id: 78, text: 'When I hear something is too ambitious or even impossible - I feel excited to do it', strength: 'Self-Believer' },
  { id: 79, text: 'I believe there are problems everywhere waiting to be solved', strength: 'Problem Solver' },
  { id: 80, text: 'I believe success is not limited to money or prestige', strength: 'Believer' },
  { id: 81, text: 'I believe actions speak louder than words', strength: 'Deliverer' },
  { id: 82, text: 'I naturally compare my results with others and therefore always strive for the best', strength: 'Winner' },
  { id: 83, text: 'I am thrilled by sudden changes, unforeseen detours, and surprises', strength: 'Chameleon' },
  { id: 84, text: 'I often get excited for no other reason than just being alive', strength: 'Optimist' },
  { id: 85, text: 'I find joy in finding the right words to craft the most powerful message', strength: 'Storyteller' },
  { id: 86, text: 'I believe that facts and numbers are the best proof for any point of view', strength: 'Analyst' },
  { id: 87, text: 'I believe surprises are great when they are planned ahead of time', strength: 'Strategist' },
  { id: 88, text: 'I believe nothing is impossible if you believe in yourself', strength: 'Self-Believer' },
  { id: 89, text: 'I believe that learning a bit from every field is better than focusing on just one', strength: 'Philomath' },
  { id: 90, text: "It is natural for me to capture people's attention", strength: 'Storyteller' },
  { id: 91, text: 'I enjoy starting something new, even if I am not the one finishing it', strength: 'Catalyst' },
  { id: 92, text: 'I believe we can reach better solutions through open confrontation', strength: 'Commander' },
  { id: 93, text: "I believe you don't have to agree with everyone to understand how they feel", strength: 'Empathizer' },
  { id: 94, text: 'I believe profound thoughts cannot be hurried - they take time to incubate', strength: 'Thinker' },
  { id: 95, text: 'I believe that even the most disadvantageous peace is better than any direct conflict', strength: 'Peace Keeper' },
  { id: 96, text: 'I believe stories are the best way to get a point across', strength: 'Storyteller' },
  { id: 97, text: 'I believe that seeing the glass half-full or half-empty is a personal choice', strength: 'Optimist' },
  { id: 98, text: 'I am driven by the feeling of greater purpose', strength: 'Believer' },
  { id: 99, text: 'I am energized by the mere fact of learning something new, regardless of what it is', strength: 'Philomath' },
  { id: 100, text: "I believe you can't solve a puzzle by looking at every piece individually", strength: 'Analyst' },
  { id: 101, text: 'I am good at finding simplicity in the midst of complexity', strength: 'Analyst' },
  { id: 102, text: 'It is natural for me to align everything I do with my core values', strength: 'Believer' },
  { id: 103, text: 'I am good at taking a fresh and creative perspective on even the most mundane things', strength: 'Brainstormer' },
  { id: 104, text: 'I am good at activating people around me and building the momentum', strength: 'Catalyst' },
  { id: 105, text: 'I am good at going with the flow and focusing on the present moment', strength: 'Chameleon' },
  { id: 106, text: 'I am good at spotting potential in others and helping them realize it', strength: 'Coach' },
  { id: 107, text: 'It is natural for me to be direct and decisive', strength: 'Commander' },
  { id: 108, text: 'I am good at getting things done', strength: 'Deliverer' },
  { id: 109, text: 'I am good at making others feel heard, understood, and included', strength: 'Empathizer' },
  { id: 110, text: 'I am good at determining what is important and essential to the task at hand', strength: 'Focus Expert' },
  { id: 111, text: 'I am good at making even the most boring tasks exciting', strength: 'Optimist' },
  { id: 112, text: 'I am good at keeping conflicts around me to a minimum', strength: 'Peace Keeper' },
  { id: 113, text: 'I am good at drawing lessons from any experience I go through', strength: 'Philomath' },
  { id: 114, text: 'I am good at assessing risks', strength: 'Strategist' },
  { id: 115, text: 'I am good at instilling certainty and confidence in other people', strength: 'Self-Believer' },
  { id: 116, text: 'I am good at explaining, describing, and entertaining', strength: 'Storyteller' },
  { id: 117, text: 'I am good at thinking several steps ahead', strength: 'Strategist' },
  { id: 118, text: 'It is natural for me to rehearse conversations in my head that I intend to have later', strength: 'Thinker' },
  { id: 119, text: 'I am good at paying attention to details', strength: 'Time Keeper' },
  { id: 120, text: 'I am good at turning any mundane task into a game or challenge', strength: 'Winner' },
];

export const strengthMetadata: Record<StrengthName, StrengthMetadata> = {
  'Believer': {
    name: 'Believer',
    domain: 'Doing',
    coreCharacteristic: 'Actions driven by core higher values that cannot be compromised',
    energizedBy: 'Aligning work with personal values and greater purpose',
    drainedBy: 'Values being questioned or misaligned with required actions',
    shortDescription: 'Driven by core values and higher purpose',
  },
  'Deliverer': {
    name: 'Deliverer',
    domain: 'Doing',
    coreCharacteristic: 'Takes ownership and follows through on commitments',
    energizedBy: 'Completing tasks and keeping promises',
    drainedBy: 'Broken promises (both giving and receiving)',
    shortDescription: 'Commits to promises and follows through',
  },
  'Focus Expert': {
    name: 'Focus Expert',
    domain: 'Doing',
    coreCharacteristic: 'Concentrates on one project until completion',
    energizedBy: 'Deep focus on single tasks without interruption',
    drainedBy: 'Multitasking and frequent context switching',
    shortDescription: 'Concentrates on one task until completion',
  },
  'Problem Solver': {
    name: 'Problem Solver',
    domain: 'Doing',
    coreCharacteristic: 'Identifies issues and develops solutions',
    energizedBy: 'Finding practical solutions to complex problems',
    drainedBy: 'Problems being ignored or left unresolved',
    shortDescription: 'Identifies issues and finds solutions',
  },
  'Time Keeper': {
    name: 'Time Keeper',
    domain: 'Doing',
    coreCharacteristic: 'Organizes processes, timelines, and schedules',
    energizedBy: 'Meeting deadlines and creating structure',
    drainedBy: 'Disorganization and missed deadlines',
    shortDescription: 'Organizes, schedules, and meets deadlines',
  },
  'Chameleon': {
    name: 'Chameleon',
    domain: 'Feeling',
    coreCharacteristic: 'Adapts quickly to changing circumstances',
    energizedBy: 'Flexibility and spontaneity',
    drainedBy: 'Rigid structures and long-term commitments',
    shortDescription: 'Adapts quickly to changing circumstances',
  },
  'Coach': {
    name: 'Coach',
    domain: 'Feeling',
    coreCharacteristic: 'Discovers potential in others and supports growth',
    energizedBy: 'Helping others develop and succeed',
    drainedBy: 'People who resist development or feedback',
    shortDescription: 'Develops potential in others',
  },
  'Empathizer': {
    name: 'Empathizer',
    domain: 'Feeling',
    coreCharacteristic: 'Senses others\' emotions and responds appropriately',
    energizedBy: 'Understanding and supporting others emotionally',
    drainedBy: 'Being asked to ignore emotions and follow strict logic',
    shortDescription: 'Senses and responds to others\' emotions',
  },
  'Optimist': {
    name: 'Optimist',
    domain: 'Feeling',
    coreCharacteristic: 'Finds positive aspects in every situation',
    energizedBy: 'Celebrating achievements and maintaining positive outlook',
    drainedBy: 'Constant negativity and criticism',
    shortDescription: 'Finds positive in every situation',
  },
  'Peace Keeper': {
    name: 'Peace Keeper',
    domain: 'Feeling',
    coreCharacteristic: 'Builds bridges and finds common ground',
    energizedBy: 'Creating harmony and reducing conflict',
    drainedBy: 'Constant friction and confrontation',
    shortDescription: 'Builds bridges and reduces conflict',
  },
  'Catalyst': {
    name: 'Catalyst',
    domain: 'Motivating',
    coreCharacteristic: 'Creates momentum and gets things started',
    energizedBy: 'Initiating action and building momentum',
    drainedBy: 'Waiting and inaction',
    shortDescription: 'Creates momentum and gets things started',
  },
  'Commander': {
    name: 'Commander',
    domain: 'Motivating',
    coreCharacteristic: 'Takes charge and makes decisive decisions',
    energizedBy: 'Being in control and leading',
    drainedBy: 'Indecision and lack of direction',
    shortDescription: 'Takes charge and makes decisive decisions',
  },
  'Self-Believer': {
    name: 'Self-Believer',
    domain: 'Motivating',
    coreCharacteristic: 'Trusts own abilities and instincts',
    energizedBy: 'Self-confidence and autonomy',
    drainedBy: 'Self-doubt and external validation dependency',
    shortDescription: 'Trusts own abilities and instincts',
  },
  'Storyteller': {
    name: 'Storyteller',
    domain: 'Motivating',
    coreCharacteristic: 'Crafts compelling narratives and messages',
    energizedBy: 'Presenting ideas and entertaining others',
    drainedBy: 'Boring, dry communication',
    shortDescription: 'Crafts compelling narratives and messages',
  },
  'Winner': {
    name: 'Winner',
    domain: 'Motivating',
    coreCharacteristic: 'Driven by competition and excellence',
    energizedBy: 'Competing and achieving top results',
    drainedBy: 'Mediocrity and lack of challenge',
    shortDescription: 'Driven by competition and achieving excellence',
  },
  'Analyst': {
    name: 'Analyst',
    domain: 'Thinking',
    coreCharacteristic: 'Seeks clarity and logic through data',
    energizedBy: 'Analyzing information and finding patterns',
    drainedBy: 'Being asked to follow heart over logic',
    shortDescription: 'Seeks clarity through data and logic',
  },
  'Brainstormer': {
    name: 'Brainstormer',
    domain: 'Thinking',
    coreCharacteristic: 'Generates creative ideas and connections',
    energizedBy: 'Thinking outside the box and innovation',
    drainedBy: 'Standard practices and closed-mindedness',
    shortDescription: 'Generates creative ideas and connections',
  },
  'Philomath': {
    name: 'Philomath',
    domain: 'Thinking',
    coreCharacteristic: 'Loves learning and acquiring knowledge',
    energizedBy: 'Learning new things regardless of topic',
    drainedBy: 'Stagnation and repetition without learning',
    shortDescription: 'Loves learning and acquiring knowledge',
  },
  'Strategist': {
    name: 'Strategist',
    domain: 'Thinking',
    coreCharacteristic: 'Thinks ahead and plans systematically',
    energizedBy: 'Long-term planning and seeing the big picture',
    drainedBy: 'Short-term focus without strategy',
    shortDescription: 'Thinks ahead and plans systematically',
  },
  'Thinker': {
    name: 'Thinker',
    domain: 'Thinking',
    coreCharacteristic: 'Enjoys intellectual activity and deep thought',
    energizedBy: 'Mental activity and intellectual discussions',
    drainedBy: 'Acting before thinking or shallow conversations',
    shortDescription: 'Enjoys intellectual activity and deep thought',
  },
};

export const domainMetadata: Record<DomainName, DomainMetadata> = {
  'Doing': {
    name: 'Doing',
    description: 'Action-oriented strengths focused on execution and results',
    orientation: 'Action-oriented',
  },
  'Feeling': {
    name: 'Feeling',
    description: 'Relationship-oriented strengths focused on people and emotions',
    orientation: 'Relationship-oriented',
  },
  'Motivating': {
    name: 'Motivating',
    description: 'Leadership-oriented strengths focused on influence and direction',
    orientation: 'Leadership-oriented',
  },
  'Thinking': {
    name: 'Thinking',
    description: 'Analytical-oriented strengths focused on ideas and strategy',
    orientation: 'Analytical-oriented',
  },
};

export const responseScale = [
  { value: 1, label: 'Strongly Disagree', shortLabel: 'Strongly Disagree' },
  { value: 2, label: 'Disagree', shortLabel: 'Disagree' },
  { value: 3, label: 'Neutral', shortLabel: 'Neutral' },
  { value: 4, label: 'Agree', shortLabel: 'Agree' },
  { value: 5, label: 'Strongly Agree', shortLabel: 'Strongly Agree' },
];
