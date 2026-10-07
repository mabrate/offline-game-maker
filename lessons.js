// Lesson data stays separate from the editor so new Python projects can add paths.
window.makeMultiplicationLesson = original => {
  const greeting = `print("Welcome to Multiplication Quest!")\n`;
  const input = `response = input("What is 6 x 7? ")
print("You typed:", response)
`;
  const number = `response = input("What is 6 x 7? ")
answer = int(response)
print("Your answer plus 1 is", answer + 1)
`;
  const conditional = `response = input("What is 6 x 7? ")
answer = int(response)

if answer == 42:
    print("Correct!")
else:
    print("Good try! The answer is 42.")
`;
  const single = `first = 6
second = 7
response = input(str(first) + " x " + str(second) + " = ")
answer = int(response)

if answer == first * second:
    print("Correct!")
else:
    print("Good try! The answer is", first * second)
`;
  const loop = `score = 0

for question in range(1, 4):
    print("Question", question)
    first = question + 5
    second = 7
    response = input(str(first) + " x " + str(second) + " = ")
    answer = int(response)
    if answer == first * second:
        score += 1
        print("Correct!")
    else:
        print("The answer is", first * second)

print("Your score is", score, "out of 3")
`;
  const random = `import random

first = random.randint(1, 12)
second = random.randint(1, 12)
answer = int(input(str(first) + " x " + str(second) + " = "))

if answer == first * second:
    print("Correct!")
else:
    print("The answer is", first * second)
`;
  const safe = `while True:
    response = input("What is 6 x 7? ")
    try:
        answer = int(response)
        break
    except ValueError:
        print("Please type a whole number.")

if answer == 42:
    print("Correct!")
else:
    print("The answer is 42.")
`;
  const repeat = `for question in range(1, 4):
    print("Question", question)

print("Quiz finished!")
`;
  const step = (title, instruction, question, code, focus) => ({title,instruction,question,code,focus});
  return {
    id: 'multiplication-quiz', version: 1,
    introduction: 'Play the working quiz first. Then choose a short path and change one thing at a time.',
    original,
    paths: [
      {id:'build',label:'Build from scratch',kind:'route',steps:[
        step('Say hello', 'Begin with one line. Change the welcome message and run it.', 'What does print() put in the terminal?', greeting, 'print("Welcome to Multiplication Quest!")'),
        step('Ask a question', 'Use input() to ask one question. Try answering with a word and then a number.', 'What type of value does input() return?', input, 'response = input("What is 6 x 7? ")'),
        step('Turn text into a number', 'Convert the response with int(). Enter 42, then try a word and read the error.', 'Why do we convert the answer before doing arithmetic?', number, 'answer = int(response)'),
        step('Check the answer', 'if checks whether the answer equals 42. else gives feedback for a wrong answer. Run it with 42, then 41; notice which indented print() runs.', 'How are == and = doing different jobs?', conditional, 'if answer == 42:'),
        step('Store the question numbers', 'first and second are variables that store the factors. str() puts them into the prompt; * multiplies them to check the answer. Change them to 3 and 8, then test 24.', 'Why can we change the factors without rewriting the answer check?', single, 'first = 6'),
        step('Repeat and keep score', 'range(1, 4) gives 1, 2, 3. first = question + 5 makes the questions 6, 7, then 8 times 7. Indented lines repeat; score += 1 adds a point.', 'Which lines repeat, and which line runs once at the end?', loop, 'for question in range(1, 4):'),
        step('Finish the working quiz', 'Combine random questions with input checking. Run the complete quiz and change its difficulty.', 'Which part would you explain to a classmate?', original, 'questions = 5')
      ]},
      {id:'simple',label:'Make a simpler version',kind:'route',steps:[
        step('One fixed question', 'Try a quiz with one question. No random numbers, score, or loop yet.', 'Can you find the input, calculation, and feedback?', single, 'first = 6'),
        step('Choose your factors', 'Change first to 3 and second to 8. Predict the answer before running.', 'Why does the feedback still work when the factors change?', single.replace('first = 6','first = 3').replace('second = 7','second = 8'), 'first = 3'),
        step('Make it yours', 'Write your own feedback in the two print() lines. Test a correct and an incorrect answer.', 'What is the smallest useful quiz you can make?', single, '    print("Correct!")')
      ]},
      {id:'further',label:'Take it further',kind:'route',steps:[
        step('Choose a difficulty', 'This version asks the player for the largest factor. Try 5, then 12.', 'How does a variable change the experience?', original.replace('largest_factor = 12','largest_factor = 12\ntry:\n    largest_factor = max(1, int(input("Largest factor (1 or more)? ")))\nexcept ValueError:\n    print("Using 12 for this round.")'), 'largest_factor = max(1, int(input("Largest factor (1 or more)? ")))'),
        step('Celebrate a perfect score', 'Give a special message when every answer is correct. Test a perfect round and a mixed round.', 'Why is this check outside the question loop?', original + '\nif score == questions:\n    print("Perfect score! You are a multiplication master.")\nelse:\n    print("Keep practicing. You are getting there!")\n', 'if score == questions:'),
        step('Count a streak', 'Track correct answers in a row. A wrong answer resets the streak.', 'Why does streak reset while score keeps its points?', original.replace('score = 0','score = 0\nstreak = 0').replace('        score += 1','        score += 1\n        streak += 1\n        print("Streak:", streak)').replace('    else:\n        print("Good try!', '    else:\n        streak = 0\n        print("Good try!'), '        streak += 1')
      ]},
      {id:'input',label:'Input & numbers',kind:'skill',steps:[
        step('Collect a response', 'input() waits for the player. print() shows the text they entered.', 'What happens if the response is a word?', input, 'response = input("What is 6 x 7? ")'),
        step('Convert the response', 'int() turns whole-number text into a number. Compare 42 and "42".', 'Which value can you add 1 to?', number, 'answer = int(response)'),
        step('Build a prompt', 'Use str() to put number variables into the question text.', 'What happens when you change first?', single, 'response = input(str(first) + " x " + str(second) + " = ")')
      ]},
      {id:'loops',label:'Loops',kind:'skill',steps:[
        step('Repeat with for', 'range(1, 4) gives 1, 2, and 3. Change 4 to 6 and predict the output.', 'Is the last number in range() included?', repeat, 'for question in range(1, 4):'),
        step('Repeat the questions', 'Put the factors, input, and feedback inside the loop. first = question + 5 changes each question. Keep the final score outside it.', 'What changes if the final print() is indented?', loop, '    first = question + 5'),
        step('Retry with while', 'while True repeats until break. Enter a word, then a whole number.', 'When do we know it is safe to leave the loop?', safe, '        break')
      ]},
      {id:'decisions',label:'Check answers',kind:'skill',steps:[
        step('Choose a branch', 'if checks whether the answer matches the product. else handles the other answers.', 'Which branch runs for 41? Which runs for 42?', single, 'if answer == first * second:'),
        step('Multiply variables', 'Use * to calculate a product. Change either factor; keep the check the same.', 'Why is this better than checking for a fixed 42?', single.replace('first = 6','first = 4'), 'if answer == first * second:')
      ]},
      {id:'score',label:'Variables & score',kind:'skill',steps:[
        step('Remember a value', 'A variable remembers the score. Change its starting value and predict the result.', 'What happens if score starts at 10?', loop, 'score = 0'),
        step('Add one point', 'score += 1 adds one to the current score. Put it only in the correct-answer branch.', 'What happens if you move that line outside the if?', loop, '        score += 1')
      ]},
      {id:'random',label:'Random questions',kind:'skill',steps:[
        step('Choose random factors', 'Import random, then pick two factors with randint(). Run several times.', 'What is the smallest possible factor? The largest?', random, 'first = random.randint(1, 12)'),
        step('Control the range', 'Use factors from 1 to 5. Keep the answer check based on the variables.', 'How could you make the quiz easier or harder?', random.replaceAll('randint(1, 12)','randint(1, 5)'), 'first = random.randint(1, 5)')
      ]},
      {id:'validation',label:'Handle bad input',kind:'skill',steps:[
        step('Catch a conversion error', 'try attempts to convert the response. except ValueError handles text that is not a whole number.', 'Why does "hello" take a different path from "42"?', safe, '    except ValueError:'),
        step('Retry the same question', 'Keep the question inside while True. break leaves the loop after a successful conversion.', 'Why should a mistyped answer not use up a question?', original, '    while True:')
      ]}
    ]
  };
};
