# A multiplication quiz written in Python.
import random

questions = 5
largest_factor = 12
score = 0

print("MULTIPLICATION QUEST")
print("Answer each question. Type a whole number.")

for question in range(1, questions + 1):
    first = random.randint(1, largest_factor)
    second = random.randint(1, largest_factor)
    print("\nQuestion", question, "of", questions)

    while True:
        response = input(str(first) + " x " + str(second) + " = ")
        try:
            answer = int(response)
            break
        except ValueError:
            print("Please type a whole number, like 12.")

    if answer == first * second:
        score += 1
        print("Correct! Nice work.")
    else:
        print("Good try! The answer is", first * second)

print("\nYou scored", score, "out of", questions)
print("Run again for a new challenge!")
