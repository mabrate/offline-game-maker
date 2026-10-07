// Local Python source and lesson content; shared by the starter and lesson examples.
window.treasureCaveCode = `import random

energy = 6
treasure = 0
room = "entrance"
escaped = False

print("TREASURE CAVE")
print("Explore three rooms. Escape before your energy runs out!")
print("Type left or right. Type quit to stop.")

while energy > 0 and not escaped:
    print("\\nEnergy:", energy, "Treasure:", treasure)
    if room == "entrance":
        print("At the entrance: left leads to crystals; right leads to the exit.")
    elif room == "crystals":
        print("In the crystal room: left opens a chest; right returns to the entrance.")
    else:
        print("At the exit: right leads outside; left returns to the crystals.")

    choice = input("Left or right? ").strip().lower()
    if choice == "quit":
        break
    if choice != "left" and choice != "right":
        print("Please type left, right, or quit. No energy lost.")
        continue

    energy -= 1
    if room == "entrance":
        if choice == "left":
            room = "crystals"
        else:
            room = "exit"
    elif room == "crystals":
        if choice == "left":
            found = random.randint(1, 3)
            treasure += found
            print("You find", found, "gold coins! The chest opens a passage to the exit.")
            room = "exit"
        else:
            room = "entrance"
    else:
        if choice == "right":
            escaped = True
        else:
            room = "crystals"

if escaped:
    print("You escaped with", treasure, "gold coins!")
elif energy == 0:
    print("Your lantern fades. Your adventure ends with", treasure, "gold coins.")
else:
    print("Adventure stopped. Run again to explore a new path!")
`;
window.makeTreasureCaveLesson = original => {
  const greeting = 'print("You enter a sparkling cave.")\n';
  const ask = greeting + 'choice = input("Left or right? ")\nprint("You chose:", choice)\n';
  const decision = greeting + `choice = input("Left or right? ").strip().lower()
if choice == "left":
    print("You find a treasure chest!")
elif choice == "right":
    print("You find the way outside!")
else:
    print("That path does not exist.")
`;
  const variables = `energy = 3
treasure = 0
print("You enter a sparkling cave.")
choice = input("Left or right? ").strip().lower()
if choice == "left":
    energy -= 1
    treasure += 2
    print("You find two gold coins!")
elif choice == "right":
    energy -= 1
    print("You find the way outside!")
else:
    print("That path does not exist.")
print("Energy:", energy, "Treasure:", treasure)
`;
  const loop = `energy = 3
treasure = 0
escaped = False
print("Left finds treasure; right leads outside.")

while energy > 0 and not escaped:
    choice = input("Left or right? ").strip().lower()
    if choice == "left":
        energy -= 1
        treasure += 2
        print("You collect two coins.")
    elif choice == "right":
        energy -= 1
        escaped = True
    else:
        print("Please type left or right.")
    print("Energy:", energy, "Treasure:", treasure)

if escaped:
    print("You escaped with", treasure, "coins!")
else:
    print("Your lantern fades. Time to rest!")
`;
  const step=(title,instruction,question,code,focus)=>({title,instruction,question,code,focus});
  return {id:'treasure-cave',version:1,original,introduction:'Explore the working cave, then build your own adventure.',paths:[
    {id:'build',label:'Build from scratch',kind:'route',steps:[
      step('Describe the cave','print() tells the story. Change the description and run it.','What should the player imagine?',greeting,'print("You enter a sparkling cave.")'),
      step('Ask for a path','input() waits for a choice and stores the text in choice. Try left and right.','Where is the player’s response stored?',ask,'choice = input("Left or right? ")'),
      step('Give choices consequences','if / elif / else select an outcome. strip().lower() lets LEFT and extra spaces work too. Test both paths and an unknown word.','Which branch runs for an unknown choice?',decision,'if choice == "left":'),
      step('Remember treasure and energy','Variables remember numbers. += 2 adds coins; -= 1 spends energy. Change the starting energy and predict the result.','Why is treasure set to zero before asking?',variables,'treasure += 2'),
      step('Keep exploring','while repeats while energy remains and escaped is False. Left earns coins; right sets escaped to True and ends the loop.','What two things can stop the loop?',loop,'while energy > 0 and not escaped:'),
      step('Explore three rooms','room remembers your location. Each room offers different choices. random.randint(1, 3) changes the chest’s reward. Try left, left, right.','Why is a room variable useful?',original,'room = "entrance"')
    ]},
    {id:'simple',label:'Make a simpler version',kind:'route',steps:[
      step('One choice, two outcomes','Try the two paths. This story has no energy, treasure count, or loop.','Which path would you change?',decision,'elif choice == "right":'),
      step('Tell your own story','Change the two outcome messages. Keep the choices and indentation.','How can the same code tell a different story?',decision,'    print("You find a treasure chest!")')
    ]},
    {id:'further',label:'Take it further',kind:'route',steps:[
      step('A longer expedition','Start with ten energy. Explore every room before escaping. Change the number to tune the challenge.','How does energy affect the number of choices?',original.replace('energy = 6','energy = 10'),'energy = 10'),
      step('A treasure goal','This version celebrates escaping with at least five coins. Visit the chest more than once.','Why do we check both escape and treasure?',original+'\nif escaped and treasure >= 5:\n    print("Treasure master! You reached the five-coin goal.")\n','if escaped and treasure >= 5:')
    ]},
    {id:'input',label:'Input & choices',kind:'skill',steps:[
      step('Read a choice','input() returns text. Print the response before giving it consequences.','Does input() decide where the player goes?',ask,'choice = input("Left or right? ")'),
      step('Accept friendly input','strip() removes surrounding spaces; lower() makes capitals lowercase. Try LEFT and right with spaces.','Why normalize the response?',decision,'choice = input("Left or right? ").strip().lower()')
    ]},
    {id:'decisions',label:'Branches',kind:'skill',steps:[
      step('Choose an outcome','Use if for left, elif for right, and else for other text. Test all three.','Why is the final else useful?',decision,'elif choice == "right":')
    ]},
    {id:'variables',label:'Treasure & energy',kind:'skill',steps:[
      step('Track the adventure','energy and treasure store numbers. Change the coin reward from two to five.','What is the difference between = and +=?',variables,'treasure += 2')
    ]},
    {id:'loops',label:'Loops & endings',kind:'skill',steps:[
      step('Explore until finished','Try left three times, then run again and try right. The loop has two possible endings.','What happens when energy reaches zero?',loop,'while energy > 0 and not escaped:')
    ]},
    {id:'random',label:'Random discoveries',kind:'skill',steps:[
      step('Open the chest','random.randint(1, 3) chooses one, two, or three coins. Change 3 to 6 and visit the chest again.','Will every chest give the same reward?',original,'found = random.randint(1, 3)')
    ]}
  ]};
};
