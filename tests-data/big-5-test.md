# **Big Five (OCEAN) Personality Test \- Reference Document**

**Test Purpose:** Assess personality across five broad trait dimensions using the IPIP Big-Five Factor Markers.

**Target Users:** High school students (Grades 9-12)  
 **Response Scale:** 1-5 Likert Scale (1 \= Very Inaccurate, 5 \= Very Accurate)  
 **Total Questions:** 50  
 **Questions per Trait:** 10 (evenly distributed)  
 **Expected Completion Time:** 8-10 minutes

---

## **Overview**

The Big Five personality model, also known as the OCEAN model or Five-Factor Model (FFM), is one of the most widely validated and researched personality frameworks in psychology. This test uses the International Personality Item Pool (IPIP) Big-Five Factor Markers developed by Lewis Goldberg, which provides a public-domain alternative to proprietary measures.

The five broad personality traits are:

* **Openness to Experience (O):** Intellectual curiosity, creativity, appreciation for art, emotion, adventure, and unusual ideas  
* **Conscientiousness (C):** Tendency to be organized, responsible, disciplined, and goal-oriented  
* **Extraversion (E):** Tendency to seek stimulation in the company of others; sociability, assertiveness, and high energy  
* **Agreeableness (A):** Tendency to be compassionate and cooperative rather than suspicious and antagonistic  
* **Emotional Stability (ES):** Opposite of Neuroticism; tendency to remain calm, even-tempered, and resilient under stress

**Note on Emotional Stability:** This test measures "Emotional Stability" rather than "Neuroticism." High scores indicate emotional stability (low neuroticism), while low scores indicate emotional reactivity (high neuroticism). This is the reverse of some Big Five implementations.

---

## **All 50 Test Questions**

### **Questions Organized by Trait and Keying**

The questions below are presented in the order they should appear in the test (mixed order). Each question is marked with its trait and whether it is positively (+) or negatively (−) keyed.

**Note:** In the actual test interface, questions should be presented in the numbered order (1-50) to avoid response bias. The trait and keying information is for scoring purposes only and should not be shown to users.

| Q\# | Statement | Trait | Key |
| ----- | ----- | ----- | ----- |
| 1 | Am the life of the party. | E | \+ |
| 2 | Feel little concern for others. | A | − |
| 3 | Am always prepared. | C | \+ |
| 4 | Get stressed out easily. | ES | − |
| 5 | Have a rich vocabulary. | O | \+ |
| 6 | Don't talk a lot. | E | − |
| 7 | Am interested in people. | A | \+ |
| 8 | Leave my belongings around. | C | − |
| 9 | Am relaxed most of the time. | ES | \+ |
| 10 | Have difficulty understanding abstract ideas. | O | − |
| 11 | Feel comfortable around people. | E | \+ |
| 12 | Insult people. | A | − |
| 13 | Pay attention to details. | C | \+ |
| 14 | Worry about things. | ES | − |
| 15 | Have a vivid imagination. | O | \+ |
| 16 | Keep in the background. | E | − |
| 17 | Sympathize with others' feelings. | A | \+ |
| 18 | Make a mess of things. | C | − |
| 19 | Seldom feel blue. | ES | \+ |
| 20 | Am not interested in abstract ideas. | O | − |
| 21 | Start conversations. | E | \+ |
| 22 | Am not interested in other people's problems. | A | − |
| 23 | Get chores done right away. | C | \+ |
| 24 | Am easily disturbed. | ES | − |
| 25 | Have excellent ideas. | O | \+ |
| 26 | Have little to say. | E | − |
| 27 | Have a soft heart. | A | \+ |
| 28 | Often forget to put things back in their proper place. | C | − |
| 29 | Get upset easily. | ES | − |
| 30 | Do not have a good imagination. | O | − |
| 31 | Talk to a lot of different people at parties. | E | \+ |
| 32 | Am not really interested in others. | A | − |
| 33 | Like order. | C | \+ |
| 34 | Change my mood a lot. | ES | − |
| 35 | Am quick to understand things. | O | \+ |
| 36 | Don't like to draw attention to myself. | E | − |
| 37 | Take time out for others. | A | \+ |
| 38 | Shirk my duties. | C | − |
| 39 | Have frequent mood swings. | ES | − |
| 40 | Use difficult words. | O | \+ |
| 41 | Don't mind being the center of attention. | E | \+ |
| 42 | Feel others' emotions. | A | \+ |
| 43 | Follow a schedule. | C | \+ |
| 44 | Get irritated easily. | ES | − |
| 45 | Spend time reflecting on things. | O | \+ |
| 46 | Am quiet around strangers. | E | − |
| 47 | Make people feel at ease. | A | \+ |
| 48 | Am exacting in my work. | C | \+ |
| 49 | Often feel blue. | ES | − |
| 50 | Am full of ideas. | O | \+ |

---

## **Response Scale Definition**

Each question is answered on a 5-point Likert scale measuring accuracy of self-description:

| Value | Label | Meaning |
| ----- | ----- | ----- |
| 1 | Very Inaccurate | The statement does not describe me at all |
| 2 | Moderately Inaccurate | The statement slightly misses describing me |
| 3 | Neither Accurate nor Inaccurate | The statement is neutral; neither fits nor doesn't fit |
| 4 | Moderately Accurate | The statement somewhat describes me |
| 5 | Very Accurate | The statement describes me very well |

**Instructions to User:**  
 "Describe yourself as you honestly see yourself, in relation to other people you know of the same sex and roughly your same age. Please read each statement carefully and indicate how accurately it describes you."

---

## **Scoring Logic & Algorithms**

### **Step 1: Item Mapping by Trait**

First, map each question to its corresponding trait and identify whether it is positively or negatively keyed:

**Extraversion (E):**

* Positive keying: Q1, Q11, Q21, Q31, Q41  
* Negative keying: Q6, Q16, Q26, Q36, Q46

**Agreeableness (A):**

* Positive keying: Q7, Q17, Q27, Q37, Q42, Q47  
* Negative keying: Q2, Q12, Q22, Q32

**Conscientiousness (C):**

* Positive keying: Q3, Q13, Q23, Q33, Q43, Q48  
* Negative keying: Q8, Q18, Q28, Q38

**Emotional Stability (ES):**

* Positive keying: Q9, Q19  
* Negative keying: Q4, Q14, Q24, Q29, Q34, Q39, Q44, Q49

**Openness to Experience (O):**

* Positive keying: Q5, Q15, Q25, Q35, Q40, Q45, Q50  
* Negative keying: Q10, Q20, Q30

### **Step 2: Reverse Score Negatively Keyed Items**

For all negatively keyed items (marked with "−"), reverse the scoring:

Reversed\_Score \= 6 \- Original\_Response

**Reversal Logic:**

* Response 1 → 5  
* Response 2 → 4  
* Response 3 → 3 (unchanged)  
* Response 4 → 2  
* Response 5 → 1

**Example:**  
 If Q6 ("Don't talk a lot") is answered with 2 (Moderately Inaccurate), the reversed score is 6 \- 2 \= 4

### **Step 3: Sum Scores by Trait**

After reversing negatively keyed items, sum all 10 item scores for each trait:

Extraversion\_Raw \= (Q1 \+ Q11 \+ Q21 \+ Q31 \+ Q41) \+ (Reversed\_Q6 \+ Reversed\_Q16 \+ Reversed\_Q26 \+ Reversed\_Q36 \+ Reversed\_Q46)

Agreeableness\_Raw \= (Q7 \+ Q17 \+ Q27 \+ Q37 \+ Q42 \+ Q47) \+ (Reversed\_Q2 \+ Reversed\_Q12 \+ Reversed\_Q22 \+ Reversed\_Q32)

Conscientiousness\_Raw \= (Q3 \+ Q13 \+ Q23 \+ Q33 \+ Q43 \+ Q48) \+ (Reversed\_Q8 \+ Reversed\_Q18 \+ Reversed\_Q28 \+ Reversed\_Q38)

Emotional\_Stability\_Raw \= (Q9 \+ Q19) \+ (Reversed\_Q4 \+ Reversed\_Q14 \+ Reversed\_Q24 \+ Reversed\_Q29 \+ Reversed\_Q34 \+ Reversed\_Q39 \+ Reversed\_Q44 \+ Reversed\_Q49)

Openness\_Raw \= (Q5 \+ Q15 \+ Q25 \+ Q35 \+ Q40 \+ Q45 \+ Q50) \+ (Reversed\_Q10 \+ Reversed\_Q20 \+ Reversed\_Q30)

**Raw Score Range:** 10-50 per trait  
 (Minimum: 10 × 1 \= 10, Maximum: 10 × 5 \= 50\)

### **Step 4: Calculate Percentile Scores (0-100 Scale)**

Convert raw scores to a 0-100 percentile scale for easier interpretation:

Percentile\_Score \= ((Raw\_Score \- 10\) / 40\) × 100

**Formula Breakdown:**

* **Minimum input (raw):** 10 (all responses \= 1\)  
* **Maximum input (raw):** 50 (all responses \= 5\)  
* **Output range:** 0-100  
* **Calculation:** Subtract minimum (10), divide by range (40), multiply by 100

**Examples:**

* Raw score 10 → ((10-10)/40) × 100 \= 0  
* Raw score 30 → ((30-10)/40) × 100 \= 50  
* Raw score 50 → ((50-10)/40) × 100 \= 100

### **Step 5: Round to Whole Numbers**

Round each percentile score to the nearest integer (0-100):

Final\_Score \= Round(Percentile\_Score, 0\)

**Rounding Convention:** Standard rounding (0.5 rounds up)

### **Step 6: Generate Trait Interpretations**

Based on the percentile scores, categorize each trait into interpretation levels:

**Score Ranges:**

* **0-20:** Very Low  
* **21-40:** Low  
* **41-60:** Moderate  
* **61-80:** High  
* **81-100:** Very High

---

## **Output Data Structure**

Return results as JSON object with the following structure:

{  
  "testType": "Big Five (OCEAN)",  
  "studentResponses": {  
    "q1": 5,  
    "q2": 2,  
    "q3": 4,  
    ...  
    "q50": 5  
  },  
  "rawScores": {  
    "Extraversion": 42,  
    "Agreeableness": 38,  
    "Conscientiousness": 45,  
    "Emotional\_Stability": 28,  
    "Openness": 41  
  },  
  "percentileScores": {  
    "Extraversion": 80,  
    "Agreeableness": 70,  
    "Conscientiousness": 88,  
    "Emotional\_Stability": 45,  
    "Openness": 78  
  },  
  "traitInterpretations": \[  
    {  
      "trait": "Openness to Experience",  
      "percentileScore": 78,  
      "rawScore": 41,  
      "level": "High",  
      "description": "Intellectually curious with a strong appreciation for art, emotion, adventure, and new ideas. Enjoys exploring unconventional perspectives and diverse experiences."  
    },  
    {  
      "trait": "Conscientiousness",  
      "percentileScore": 88,  
      "rawScore": 45,  
      "level": "Very High",  
      "description": "Highly organized, responsible, and disciplined. Strong tendency to be goal-oriented, detail-focused, and committed to completing tasks thoroughly and on time."  
    },  
    {  
      "trait": "Extraversion",  
      "percentileScore": 80,  
      "rawScore": 42,  
      "level": "High",  
      "description": "Energized by social interactions and external activities. Comfortable in groups, enjoys being the center of attention, and actively seeks out social stimulation."  
    },  
    {  
      "trait": "Agreeableness",  
      "percentileScore": 70,  
      "rawScore": 38,  
      "level": "High",  
      "description": "Compassionate and cooperative with a strong tendency to trust others. Values harmony in relationships and shows genuine concern for others' wellbeing."  
    },  
    {  
      "trait": "Emotional Stability",  
      "percentileScore": 45,  
      "rawScore": 28,  
      "level": "Moderate",  
      "description": "Generally maintains emotional balance with occasional reactivity to stress. May experience mood fluctuations but typically manages emotions reasonably well."  
    }  
  \]  
}

---

## **Key Implementation Notes**

1. **Question Order:** Present all 50 questions in the numbered sequence (Q1-Q50) to reduce response bias. Do NOT group by trait.

2. **Reverse Scoring:** Critical to implement correctly. All negatively keyed items must be reversed BEFORE summing.

3. **Trait Names:**

   * Use "Emotional Stability" (not "Neuroticism") for consistency  
   * Use "Openness to Experience" or "Openness" (both acceptable)  
   * Some implementations use "Intellect" or "Imagination" instead of "Openness" \- we use "Openness"  
4. **Scoring Precision:** Maintain at least 2 decimal places in intermediate calculations before final rounding.

5. **Score Interpretation Ranges:**

   * **0-20:** Very Low \- Trait is minimally present  
   * **21-40:** Low \- Trait is present but not dominant  
   * **41-60:** Moderate \- Average expression of trait  
   * **61-80:** High \- Trait is clearly dominant  
   * **81-100:** Very High \- Trait is extremely dominant  
6. **Cultural Considerations:** The test has been validated across multiple cultures and languages, showing consistent factor structure internationally.

---

## **Trait Descriptions for Students**

### **Openness to Experience (O)**

**High Scorers:** Creative, curious, open-minded, and imaginative. Enjoy learning new things, exploring ideas, and appreciating art and beauty. Comfortable with ambiguity and abstract concepts.

**Low Scorers:** Practical, conventional, and prefer routine. Focus on concrete facts rather than abstract theories. May be more conservative in thinking and prefer tried-and-true methods.

**Career Fit:** High openness suits creative fields (arts, design, writing), research, and innovation-focused roles. Low openness suits structured environments with clear procedures.

---

### **Conscientiousness (C)**

**High Scorers:** Organized, responsible, disciplined, and goal-oriented. Plan ahead, follow through on commitments, and pay attention to details. Strong work ethic and self-control.

**Low Scorers:** More spontaneous, flexible, and casual about organization. May be less focused on long-term goals and more comfortable with disorder. Can adapt quickly to changing circumstances.

**Career Fit:** High conscientiousness suits roles requiring precision, planning, and reliability (engineering, medicine, accounting). Low conscientiousness may suit creative, fast-paced environments.

---

### **Extraversion (E)**

**High Scorers:** Outgoing, energetic, and sociable. Draw energy from interactions with others. Comfortable being the center of attention, talkative, and assertive. Seek external stimulation.

**Low Scorers (Introverts):** Reserved, quiet, and prefer solitude or small groups. Draw energy from alone time. More comfortable listening than speaking. Prefer deep, one-on-one conversations.

**Career Fit:** High extraversion suits people-facing roles (sales, PR, teaching, management). Low extraversion suits independent work, research, or technical roles.

---

### **Agreeableness (A)**

**High Scorers:** Compassionate, cooperative, trusting, and empathetic. Value harmony and getting along with others. Helpful, kind, and considerate. Place others' needs alongside their own.

**Low Scorers:** More skeptical, competitive, and direct. Prioritize truth over tact. May challenge others' ideas. More self-focused and less concerned with maintaining harmony.

**Career Fit:** High agreeableness suits helping professions (counseling, healthcare, social work). Low agreeableness may suit competitive fields or roles requiring tough decisions.

---

### **Emotional Stability (ES) / Neuroticism (N)**

**High Emotional Stability (Low Neuroticism):** Calm, even-tempered, and resilient. Handle stress well and recover quickly from setbacks. Maintain emotional equilibrium even in challenging situations.

**Low Emotional Stability (High Neuroticism):** More reactive to stress, anxiety, and negative emotions. May experience mood swings and worry more. More sensitive to criticism and setbacks.

**Career Fit:** High stability suits high-pressure roles (emergency services, leadership, crisis management). Lower stability benefits from supportive, low-stress environments.

---

## **Integration with Report Generation**

For Make.com webhook integration, format output as:

{  
  "testName": "Big Five (OCEAN)",  
  "traitScores": {  
    "Openness": 78,  
    "Conscientiousness": 88,  
    "Extraversion": 80,  
    "Agreeableness": 70,  
    "Emotional\_Stability": 45  
  },  
  "insights": "Student demonstrates high conscientiousness and extraversion, suggesting strong organizational skills combined with social energy. High openness indicates intellectual curiosity and creativity. Moderate emotional stability suggests generally good stress management with room for developing additional coping strategies."  
}

---

## **Scientific Basis**

**Theory:** Five-Factor Model of Personality (Costa & McCrae; Goldberg)  
 **Publication:** Goldberg, L. R. (1999). A broad-bandwidth, public-domain, personality inventory measuring the lower-level facets of several five-factor models.  
 **Validation:** IPIP Big-Five Factor Markers correlate .85-.92 with NEO-PI-R when corrected for unreliability  
 **Reliability:** Cronbach's alpha ranges from .79-.87 for 10-item scales  
 **Cross-cultural:** Validated across 50+ countries with consistent factor structure  
 **Test-Retest:** Good stability over time (r \= .65-.80 over several months)

---

## **Common Score Patterns**

1. **High C \+ High E:** Organized leader; excels in management and team leadership roles  
2. **High O \+ Low C:** Creative but disorganized; may need structure and deadlines  
3. **High A \+ High ES:** Calm and cooperative; excellent for healthcare and counseling  
4. **Low A \+ High C:** Competitive perfectionist; suits high-stakes competitive fields  
5. **High E \+ Low ES:** Socially engaged but may be stress-prone; needs emotional management strategies  
6. **High O \+ High E:** Innovative communicator; excels in creative leadership and entrepreneurship

---

## **Reverse-Keyed Items Explanation**

**Why reverse scoring?**  
 Some items are worded negatively to reduce acquiescence bias (tendency to agree with statements). By mixing positive and negative items, we ensure more accurate measurements.

**Example:**

* Q1: "Am the life of the party" (positive) \- Agreement indicates high extraversion  
* Q6: "Don't talk a lot" (negative) \- Agreement indicates low extraversion

Both measure extraversion, but from opposite directions. Reversing Q6's score ensures both items contribute positively to the extraversion total.

---

## **End of Document**

**Document Version:** 1.0  
 **Last Updated:** \[Implementation Date\]  
 **For Use With:** Beacon House Psychometric Analysis Tool  
 **Source:** IPIP Big-Five Factor Markers (ipip.ori.org)  
 **License:** Public Domain \- Free to use without permission

