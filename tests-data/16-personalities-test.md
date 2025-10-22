# **16 Personalities Test \- Reference Document**

**Test Purpose:** Measure personality type preferences based on Myers-Briggs theory to determine one of 16 personality types.

**Target Users:** High school students (Grades 9-12)  
 **Response Scale:** 1-5 Likert Scale (1 \= Strongly Disagree, 5 \= Strongly Agree)  
 **Total Questions:** 32  
 **Dimensions Measured:** 5 dichotomous preference pairs  
 **Expected Completion Time:** 8-10 minutes

---

## **Overview**

The 16 Personalities test is based on Myers-Briggs Type Indicator (MBTI) theory. It measures how individuals prefer to:

1. **Gain Energy (E-I):** Extraversion vs. Introversion  
2. **Process Information (S-N):** Sensing/Observant vs. Intuition  
3. **Make Decisions (T-F):** Thinking vs. Feeling  
4. **Approach Life (J-P):** Judging vs. Perceiving  
5. **Self-View (A-T):** Assertive vs. Turbulent

These five dichotomies combine to create preference scores across five dimensions.

---

## **All 32 Test Questions**

**Note:** Questions are presented in order (Q1-Q32), randomly distributed across dimensions to reduce bias.

### **Complete Question Set**

1. You tend to seek out social interaction and enjoy being the center of attention.  
2. You prefer to focus on the big picture rather than getting caught up in details.  
3. You make decisions based primarily on objective logic and factual analysis.  
4. You enjoy planning and organizing activities well in advance.  
5. You tend to question yourself and worry about things that might go wrong.  
6. You prefer to spend time alone rather than in large groups.  
7. You are more comfortable following established procedures than trying new approaches.  
8. You base your decisions on how actions will affect people's feelings.  
9. You prefer to keep your options open rather than commit to a plan.  
10. You feel confident in yourself and rarely doubt your decisions.  
11. You find it easy to connect with others and build relationships quickly.  
12. You tend to think about abstract concepts and future possibilities.  
13. You are primarily motivated by helping others and serving their needs.  
14. You like to have everything organized and scheduled.  
15. You often feel anxious about your performance and abilities.  
16. You prefer quiet environments where you can focus on your thoughts.  
17. You enjoy working with concrete facts and practical information.  
18. You are quick to spot inconsistencies in arguments or information.  
19. You like to start projects but sometimes struggle to finish them.  
20. You believe you can succeed in most situations you face.  
21. You find large social gatherings energizing and enjoyable.  
22. You prefer to develop ideas through discussion and interaction.  
23. You prioritize maintaining harmony and avoiding conflict.  
24. You prefer structure and having clear expectations about what to do.  
25. You often worry about things outside your control.  
26. You need significant time alone to recharge after social activities.  
27. You tend to remember specific facts and experiences in detail.  
28. You are more interested in how something could work than how it currently works.  
29. You make choices based on what feels right rather than logical analysis.  
30. You prefer having a solid plan before starting something important.  
31. You tend to be confident about your future prospects.  
32. You enjoy meeting new people and making new friends regularly.

---

## **Response Scale Definition**

Each question is answered on a 5-point Likert scale:

| Value | Label | Meaning |
| ----- | ----- | ----- |
| 1 | Strongly Disagree | Completely disagree; the statement does not describe you |
| 2 | Disagree | Mostly disagree; the statement doesn't align with your preference |
| 3 | Neutral/Unsure | Neither agree nor disagree; both could be true for you |
| 4 | Agree | Mostly agree; the statement generally describes your preference |
| 5 | Strongly Agree | Completely agree; the statement clearly describes you |

---

## **Scoring Logic & Algorithms**

### **Step 1: Question-to-Dimension Mapping**

Questions are assigned to five preference dimensions. Each question has a **keying direction** (forward \= \+1, reverse \= \-1):

**Dimension 1: Extraversion (E) vs. Introversion (I)**

* E+ (Forward): 1, 11, 21, 32 (Extraverted tendency)  
* I- (Reverse): 6, 16, 26 (Introverted tendency \- score inverted)

**Dimension 2: Sensing (S) vs. Intuition (N)**

* S+ (Forward): 7, 17, 27 (Sensing/Observant tendency)  
* N- (Reverse): 2, 12, 22, 28 (Intuitive tendency \- score inverted)

**Dimension 3: Thinking (T) vs. Feeling (F)**

* T+ (Forward): 3, 13, 18 (Thinking tendency)  
* F- (Reverse): 8, 23, 29 (Feeling tendency \- score inverted)

**Dimension 4: Judging (J) vs. Perceiving (P)**

* J+ (Forward): 4, 14, 24, 30 (Judging tendency)  
* P- (Reverse): 9, 19 (Perceiving tendency \- score inverted)

**Dimension 5: Assertive (A) vs. Turbulent (T)**

* A+ (Forward): 10, 20, 31 (Assertive tendency)  
* T- (Reverse): 5, 15, 25 (Turbulent tendency \- score inverted)

### **Step 2: Score Reversal for Reverse-Keyed Questions**

For reverse-keyed questions, invert the score:

Inverted\_Score \= 6 \- Original\_Score

**Examples:**

* Original response: 5 → Inverted: 1  
* Original response: 4 → Inverted: 2  
* Original response: 3 → Inverted: 3  
* Original response: 2 → Inverted: 4  
* Original response: 1 → Inverted: 5

### **Step 3: Calculate Dimension Scores**

For each of the five dimensions, calculate the raw dimension score by summing all associated question responses (after reversal):

Extraversion\_Score \= Sum(Q1, Q11, Q21, Q32, Inverted\[Q6, Q16, Q26\])  
Sensing\_Score \= Sum(Q7, Q17, Q27, Inverted\[Q2, Q12, Q22, Q28\])  
Thinking\_Score \= Sum(Q3, Q13, Q18, Inverted\[Q8, Q23, Q29\])  
Judging\_Score \= Sum(Q4, Q14, Q24, Q30, Inverted\[Q9, Q19\])  
Assertive\_Score \= Sum(Q10, Q20, Q31, Inverted\[Q5, Q15, Q25\])

**Score Ranges:**

* Extraversion: 7-35 (7 questions)  
* Sensing: 7-35 (7 questions)  
* Thinking: 7-35 (7 questions)  
* Judging: 7-35 (7 questions)  
* Assertive: 7-35 (7 questions)

### **Step 4: Normalize Dimension Scores to Percentages (0-100)**

Convert raw dimension scores to a 0-100 scale:

Dimension\_Percentage \= ((Raw\_Score \- 7\) / (35 \- 7)) × 100  
Dimension\_Percentage \= ((Raw\_Score \- 7\) / 28\) × 100

**Formula Breakdown:**

* Minimum raw score: 7 (all responses \= 1\)  
* Maximum raw score: 35 (all responses \= 5\)  
* Output range: 0-100

**Examples:**

* Raw 7 → (7-7)/28 × 100 \= 0%  
* Raw 21 → (21-7)/28 × 100 \= 50%  
* Raw 35 → (35-7)/28 × 100 \= 100%

### **Step 5: Determine Preference Direction**

For each dimension, determine the dominant preference:

IF Dimension\_Percentage \>= 50:  
  Preference \= Dominant side (E, N, F, P, A)  
ELSE:  
  Preference \= Recessive side (I, S, T, J, T)

**Preference Clarity** \= |Dimension\_Percentage \- 50|

* 50-55%: Slight preference  
* 56-65%: Moderate preference  
* 66-75%: Clear preference  
* 76+%: Very clear preference

### **Step 6: Generate 16-Type Code**

Combine the four primary dimensions (E/I, S/N, T/F, J/P) into a four-letter code:

Type\_Code \= \[E/I\] \+ \[S/N\] \+ \[T/F\] \+ \[J/P\]

**Examples:**

* INTJ: Introvert, Intuitive, Thinking, Judging  
* ESFP: Extravert, Sensing, Feeling, Perceiving  
* ENFP: Extravert, Intuitive, Feeling, Perceiving

### **Step 7: Determine Turbulent/Assertive Variant**

The fifth dimension (Assertive/Turbulent) modifies the 16-type code:

IF Assertive\_Score \>= 50:  
  Variant \= "Assertive" (e.g., INTJ-A)  
ELSE:  
  Variant \= "Turbulent" (e.g., INTJ-T)

**Final Type Code:** \[4-Letter Type\]-\[Assertive/Turbulent\]

---

## **Output Data Structure**

Return results as JSON object with the following structure:

{  
  "testType": "16Personalities",  
  "studentResponses": {  
    "q1": 4,  
    "q2": 3,  
    "q3": 5,  
    ...  
    "q32": 2  
  },  
  "dimensionScores": {  
    "Extraversion": {  
      "raw": 24,  
      "normalized": 57,  
      "preference": "Extravert",  
      "clarityPercentage": 7,  
      "clarityLevel": "Slight"  
    },  
    "Sensing": {  
      "raw": 18,  
      "normalized": 39,  
      "preference": "Intuitive",  
      "clarityPercentage": 11,  
      "clarityLevel": "Slight"  
    },  
    "Thinking": {  
      "raw": 26,  
      "normalized": 68,  
      "preference": "Thinking",  
      "clarityPercentage": 18,  
      "clarityLevel": "Clear"  
    },  
    "Judging": {  
      "raw": 28,  
      "normalized": 75,  
      "preference": "Judging",  
      "clarityPercentage": 25,  
      "clarityLevel": "Clear"  
    },  
    "Assertive": {  
      "raw": 20,  
      "normalized": 46,  
      "preference": "Turbulent",  
      "clarityPercentage": 4,  
      "clarityLevel": "Slight"  
    }  
  },  
  "personalityType": {  
    "fourLetterCode": "ENTJ",  
    "variant": "Turbulent",  
    "fullCode": "ENTJ-T",  
    "description": "Extraverted, Intuitive, Thinking, Judging with Turbulent identity"  
  },  
  "preferences": \[  
    {  
      "dimension": "Extraverted Vs Introverted",  
      "score": "57% Extraverted",  
      "meaning": "Draws energy from social interactions and tends to be outwardly focused and action-oriented"  
    },  
    {  
      "dimension": "Intuitive Vs Observant",  
      "score": "39% Intuitive",  
      "meaning": "Prefers abstract concepts and future possibilities over concrete details and immediate reality"  
    },  
    {  
      "dimension": "Thinking Vs Feeling",  
      "score": "68% Thinking",  
      "meaning": "Makes decisions based on objective logic and consistency rather than personal values or impact on others"  
    },  
    {  
      "dimension": "Judging Vs Perceiving",  
      "score": "75% Judging",  
      "meaning": "Prefers structure, organization, and planning; likes to have things decided and settled"  
    },  
    {  
      "dimension": "Assertive Vs Turbulent",  
      "score": "46% Turbulent",  
      "meaning": "Questions own abilities and is motivated to improve; sensitive to stress and self-critical"  
    }  
  \]  
}

---

## **16 Personality Type Definitions**

### **Analysts (NT \- Thinking \+ Intuitive)**

* **INTJ:** The Logistician \- Strategic, independent, competent  
* **INTP:** The Logician \- Innovative, curious, analytical  
* **ENTJ:** The Commander \- Natural leader, strategic, determined  
* **ENTP:** The Debater \- Innovative, argumentative, energetic

### **Diplomats (NF \- Feeling \+ Intuitive)**

* **INFJ:** The Advocate \- Insightful, creative, inspirational  
* **INFP:** The Mediator \- Idealistic, open-minded, creative  
* **ENFJ:** The Protagonist \- Charismatic, empathetic, inspiring  
* **ENFP:** The Campaigner \- Enthusiastic, creative, spontaneous

### **Sentinels (SJ \- Sensing \+ Judging)**

* **ISTJ:** The Logistician \- Responsible, disciplined, practical  
* **ISFJ:** The Defender \- Supportive, reliable, devoted  
* **ESTJ:** The Executive \- Organized, efficient, dependable  
* **ESFJ:** The Consul \- Caring, social, responsible

### **Explorers (SP \- Sensing \+ Perceiving)**

* **ISTP:** The Virtuoso \- Practical, logical, independent  
* **ISFP:** The Adventurer \- Sensitive, adventurous, artistic  
* **ESTP:** The Entrepreneur \- Energetic, pragmatic, action-oriented  
* **ESFP:** The Entertainer \- Outgoing, spontaneous, enthusiastic

---

## **Key Implementation Notes**

1. **Question Presentation:** Randomize question order in UI to prevent response patterns, but maintain mapping accuracy in backend scoring.

2. **Reverse Scoring Accuracy:** Ensure reverse-keyed questions are inverted correctly before dimension calculations. This is critical for result accuracy.

3. **Score Rounding:** Round normalized percentages to whole numbers (0-100 scale).

4. **Preference Clarity:** Calculate and display how strong each preference is (slight, moderate, clear, very clear) based on distance from 50%.

5. **Turbulent vs. Assertive:** The 5th dimension (Assertive/Turbulent) is independent of the 16 types and adds nuance to interpretation. A person's turbulence level affects emotional resilience and self-confidence.

6. **Score Interpretation:**

   * 0-35%: Strong preference for recessive trait  
   * 36-49%: Moderate preference for recessive trait  
   * 50%: Perfectly balanced (extremely rare)  
   * 51-64%: Moderate preference for dominant trait  
   * 65-100%: Strong preference for dominant trait

---

## **Integration with Report Generation**

For Make.com webhook integration, format output as:

{  
  "testName": "16Personalities",  
  "typeCode": "ENTJ-T",  
  "fourLetterType": "ENTJ",  
  "variant": "Turbulent",  
  "dimensionData": {  
    "EI": {  
      "value": 57,  
      "preference": "Extraverted"  
    },  
    "SN": {  
      "value": 39,  
      "preference": "Intuitive"  
    },  
    "TF": {  
      "value": 68,  
      "preference": "Thinking"  
    },  
    "JP": {  
      "value": 75,  
      "preference": "Judging"  
    },  
    "AT": {  
      "value": 46,  
      "preference": "Turbulent"  
    }  
  },  
  "insights": "Student is a commanding strategic thinker who thrives in leadership roles, driven by competence and future vision. Their turbulent nature suggests perfectionism and self-reflection that can enhance personal growth when channeled constructively."  
}

---

## **Scientific Basis**

**Theory:** Myers-Briggs Type Theory (based on Carl Jung's Psychological Type Theory)  
 **Original Development:** Katharine Cook Briggs & Isabel Briggs Myers (1942)  
 **Theoretical Foundation:** Jung, C. G. (1921). Psychological Types  
 **Current Validation:** 16personalities.com uses continuous trait model rather than strict type dichotomy  
 **Reliability:** Test-retest reliability varies; cognitive preferences are more stable than emotional states  
 **Clinical Use:** Widely used in career counseling, team development, and personal development

---

## **Important Disclaimers**

1. **Type Fluidity:** Personality types can shift based on life circumstances, stress levels, and personal development. Results reflect preferences at time of testing.

2. **Not Deterministic:** Type code does not predict career success, intelligence, or capability. All types are equally valuable.

3. **Spectrum, Not Categories:** Personality exists on a spectrum. The 50% threshold is a simplification; people can have slight preferences that shift over time.

4. **Self-Report Bias:** Results depend on honest self-reporting and accurate self-knowledge. Stressed or inauthentic responses may produce inaccurate results.

---

## **Common Score Patterns & Interpretations**

1. **All scores 40-60%:** Highly adaptable person; can thrive in diverse environments but may lack consistent self-identity

2. **One extreme score (20% or 80%):** Very clear preference in one area; may struggle with opposite preference

3. **Balanced E/I (48-52%):** Ambivert; can be both social and introspective depending on context

4. **High Turbulence (\< 40%):** Self-critical, perfectionist, motivated by internal standards; prone to anxiety

5. **High Assertiveness (\> 60%):** Confident, resilient, less bothered by criticism; may overlook areas for growth

---

## **End of Document**

**Document Version:** 1.0  
 **Last Updated:** \[Implementation Date\]  
 **For Use With:** Beacon House Psychometric Analysis Tool

---

## **Additional Resources**

* **Cognitive Functions:** For deeper understanding, explore the 8 cognitive functions and their stacking order  
* **Career Alignment:** Cross-reference type with RIASEC codes for comprehensive career guidance  
* **Relationship Dynamics:** Use type compatibility for team-building and relationship insights

