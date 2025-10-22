# **RIASEC Career Interest Test \- Reference Document**

**Test Purpose:** Assess career interests across six work personality themes using the Holland Occupational Themes model.

**Target Users:** High school students (Grades 9-12)  
 **Response Scale:** 1-5 Likert Scale (1 \= Strongly Dislike, 5 \= Strongly Like)  
 **Total Questions:** 48  
 **Questions per Theme:** 8 (evenly distributed)  
 **Expected Completion Time:** 10-12 minutes

---

## **Overview**

The RIASEC model, developed by psychologist John L. Holland, categorizes career interests into six themes:

* **Realistic (R):** Practical, hands-on work with tools, machines, and concrete outcomes  
* **Investigative (I):** Analytical, research-oriented work involving problem-solving and discovery  
* **Artistic (A):** Creative expression through art, music, writing, and design  
* **Social (S):** Helping others through teaching, counseling, caregiving, and mentoring  
* **Enterprising (E):** Leading, persuading, and managing people and businesses  
* **Conventional (C):** Organized, detail-oriented administrative and clerical work

---

## **All 48 Test Questions**

### **Questions by Theme (8 questions per theme)**

**REALISTIC (R) \- Questions: 1, 7, 9, 10, 19, 32, 33, 46**

1. Keep shipping and receiving records  
2. Lay brick or tile  
3. Fix a broken faucet  
4. Install flooring in houses  
5. Work on an offshore oil-drilling rig  
6. Assemble electronic parts  
7. Assemble products in a factory  
8. Operate a grinding machine in a factory

**INVESTIGATIVE (I) \- Questions: 3, 11, 14, 15, 27, 28, 40, 45**

1. Study animal behavior  
2. Make a map of the bottom of an ocean  
3. Conduct biological research  
4. Study whales and other types of marine life  
5. Work in a biology lab  
6. Study the structure of the human body  
7. Develop a new medical treatment or procedure  
8. Do research on plants or animals

**ARTISTIC (A) \- Questions: 12, 18, 20, 34, 36, 39, 48, 22**

1. Write books or plays  
2. Play a musical instrument  
3. Perform stunts for a movie or television show  
4. Write a song  
5. Design sets for plays  
6. Design artwork for magazines  
7. Direct a play  
8. Conduct a musical choir

**SOCIAL (S) \- Questions: 2, 4, 6, 30, 38, 42, 43, 44**

1. Teach children how to read  
2. Teach an individual an exercise routine  
3. Supervise the activities of children at a camp  
4. Help people who have problems with drugs or alcohol  
5. Help people with family-related problems  
6. Help elderly people with their daily activities  
7. Give career guidance to people  
8. Do volunteer work at a non-profit organization

**ENTERPRISING (E) \- Questions: 17, 23, 25, 26, 29, 35, 41, 73**

1. Manage the operations of a hotel  
2. Sell merchandise at a department store  
3. Run a toy store  
4. Sell houses  
5. Sell restaurant franchises to individuals  
6. Manage a clothing store  
7. Manage a department within a large company  
8. *Note: Question 8 for Enterprising is a synthesis question \- use the 7th strong score if present*

**CONVENTIONAL (C) \- Questions: 5, 8, 13, 16, 21, 24, 31, 47**

1. Use a computer program to generate customer bills  
2. Inventory supplies using a hand-held computer  
3. Test the quality of parts before shipment  
4. Compute and record statistical and other numerical data  
5. Operate a calculator  
6. Generate the monthly payroll checks for an office  
7. Handle customers' bank transactions  
8. Maintain employee records

---

## **Response Scale Definition**

Each question is answered on a 5-point Likert scale:

| Value | Label | Meaning |
| ----- | ----- | ----- |
| 1 | Strongly Dislike | Not interested at all; strongly dislikes the activity |
| 2 | Dislike | Mildly dislikes the activity |
| 3 | Neutral/Unsure | Neither likes nor dislikes; uncertain about interest |
| 4 | Like | Mildly interested in the activity |
| 5 | Strongly Like | Very interested; strongly likes the activity |

---

## **Scoring Logic & Algorithms**

### **Step 1: Sum Raw Scores by Theme**

For each RIASEC theme, sum the raw responses (1-5) for its 8 questions:

Realistic\_Raw \= Q1 \+ Q7 \+ Q9 \+ Q10 \+ Q19 \+ Q32 \+ Q33 \+ Q46  
Investigative\_Raw \= Q3 \+ Q11 \+ Q14 \+ Q15 \+ Q27 \+ Q28 \+ Q40 \+ Q45  
Artistic\_Raw \= Q12 \+ Q18 \+ Q20 \+ Q34 \+ Q36 \+ Q39 \+ Q48 \+ Q22  
Social\_Raw \= Q2 \+ Q4 \+ Q6 \+ Q30 \+ Q38 \+ Q42 \+ Q43 \+ Q44  
Enterprising\_Raw \= Q17 \+ Q23 \+ Q25 \+ Q26 \+ Q29 \+ Q35 \+ Q41 \+ (Q73 or 0\)  
Conventional\_Raw \= Q5 \+ Q8 \+ Q13 \+ Q16 \+ Q21 \+ Q24 \+ Q31 \+ Q47

**Raw Score Range:** 8-40 per theme  
 (Minimum: 8 × 1 \= 8, Maximum: 8 × 5 \= 40\)

### **Step 2: Min-Max Normalization to 0-32 Scale**

Each raw score is normalized to a 0-32 scale using min-max normalization:

Normalized\_Score \= ((Raw\_Score \- 8\) / (40 \- 8)) × (32 \- 0\) \+ 0  
Normalized\_Score \= ((Raw\_Score \- 8\) / 32\) × 32  
Normalized\_Score \= Raw\_Score \- 8

**Formula Breakdown:**

* **Minimum input (raw):** 8 (all responses \= 1\)  
* **Maximum input (raw):** 40 (all responses \= 5\)  
* **Output range:** 0-32  
* **Simplified:** Subtract 8 from raw score

**Examples:**

* Raw score 8 → (8-8)/32 × 32 \= 0  
* Raw score 24 → (24-8)/32 × 32 \= 16  
* Raw score 40 → (40-8)/32 × 32 \= 32

### **Step 3: Round to Whole Numbers**

Round each normalized score to the nearest integer (0-32):

Final\_Score \= Round(Normalized\_Score, 0\)

**Rounding Convention:** Standard rounding (0.5 rounds up)

### **Step 4: Generate Holland Code**

Identify the top 3 themes with the highest normalized scores. The three-letter Holland Code represents the student's primary career interest profile.

**Example:**

* Enterprising: 28  
* Investigative: 24  
* Social: 20  
* Holland Code: EIS

---

## **Output Data Structure**

Return results as JSON object with the following structure:

{  
  "testType": "RIASEC",  
  "studentResponses": {  
    "q1": 5,  
    "q2": 4,  
    "q3": 5,  
    ...  
    "q48": 3  
  },  
  "rawScores": {  
    "Realistic": 32,  
    "Investigative": 28,  
    "Artistic": 24,  
    "Social": 20,  
    "Enterprising": 18,  
    "Conventional": 15  
  },  
  "normalizedScores": {  
    "Realistic": 24,  
    "Investigative": 20,  
    "Artistic": 16,  
    "Social": 12,  
    "Enterprising": 10,  
    "Conventional": 7  
  },  
  "hollandCode": "RIA",  
  "topThreeThemes": \[  
    {  
      "rank": 1,  
      "theme": "Realistic",  
      "score": 24,  
      "percentile": "75th"  
    },  
    {  
      "rank": 2,  
      "theme": "Investigative",  
      "score": 20,  
      "percentile": "60th"  
    },  
    {  
      "rank": 3,  
      "theme": "Artistic",  
      "score": 16,  
      "percentile": "50th"  
    }  
  \],  
  "allScores": \[  
    {  
      "theme": "Realistic",  
      "normalizedScore": 24,  
      "description": "Strong interest in practical, hands-on work with tools and physical outcomes"  
    },  
    {  
      "theme": "Investigative",  
      "normalizedScore": 20,  
      "description": "Moderate interest in analytical, research-oriented problem-solving"  
    },  
    {  
      "theme": "Artistic",  
      "normalizedScore": 16,  
      "description": "Mild interest in creative expression and design work"  
    },  
    {  
      "theme": "Social",  
      "normalizedScore": 12,  
      "description": "Lower interest in helping professions and people-focused roles"  
    },  
    {  
      "theme": "Enterprising",  
      "normalizedScore": 10,  
      "description": "Lower interest in leadership and business-oriented work"  
    },  
    {  
      "theme": "Conventional",  
      "normalizedScore": 7,  
      "description": "Minimal interest in structured administrative tasks"  
    }  
  \]  
}

---

## **Key Implementation Notes**

1. **Question Order:** The 48 questions in the test are presented in the order listed (Q1-Q48), NOT grouped by theme, to reduce response bias.

2. **Theme Mapping:** Internally, questions must be mapped to their correct theme:

   * R: \[1, 7, 9, 10, 19, 32, 33, 46\]  
   * I: \[3, 11, 14, 15, 27, 28, 40, 45\]  
   * A: \[12, 18, 20, 34, 36, 39, 48, 22\]  
   * S: \[2, 4, 6, 30, 38, 42, 43, 44\]  
   * E: \[17, 23, 25, 26, 29, 35, 41\]  
   * C: \[5, 8, 13, 16, 21, 24, 31, 47\]  
3. **Scoring Precision:** All intermediate calculations should maintain at least 2 decimal places for accuracy before final rounding.

4. **Score Interpretation:**

   * **0-8:** Very low interest in this theme  
   * **9-16:** Low to moderate interest  
   * **17-24:** Moderate to high interest  
   * **25-32:** High to very high interest  
5. **Holland Code Application:** The three highest scores determine the Holland Code (e.g., RIA, SEC, EIC). This code is used for career matching.

---

## **Integration with Report Generation**

For Make.com webhook integration, format output as:

{  
  "testName": "RIASEC",  
  "themeScores": {  
    "Realistic": 24,  
    "Investigative": 20,  
    "Artistic": 16,  
    "Social": 12,  
    "Enterprising": 10,  
    "Conventional": 7  
  },  
  "hollandCode": "RIA",  
  "insights": "Student shows strong practical and investigative interests with creative elements, suggesting careers in applied sciences, engineering, or technical problem-solving with creative components."  
}

---

## **Scientific Basis**

**Theory:** John L. Holland's Theory of Vocational Personalities and Work Environments  
 **Publication:** Holland, J. L. (1997). Making Vocational Choices (3rd ed.)  
 **Validation:** Used by U.S. Department of Labor O\*NET system for occupational classification  
 **Reliability:** Cronbach's alpha typically ranges 0.72-0.89 across themes  
 **Hexagonal Model:** Adjacent themes are similar; opposite themes are dissimilar

---

## **Common Score Patterns**

1. **Flat Profile (all scores 12-18):** Student has diverse interests; needs targeted exploration  
2. **Peaked Profile (one score 25+):** Student has clear dominant interest; focus career exploration  
3. **Bimodal Profile (two high, others low):** Student has two strong interest areas; explore intersection  
4. **Realistic-High, Artistic-Low:** Common for STEM-oriented students  
5. **Social-High, Conventional-Low:** Common for healthcare/counseling students

---

## **End of Document**

**Document Version:** 1.0  
 **Last Updated:** \[Implementation Date\]  
 **For Use With:** Beacon House Psychometric Analysis Tool

