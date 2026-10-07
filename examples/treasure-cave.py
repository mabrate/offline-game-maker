import random

energy = 6
treasure = 0
room = "entrance"
escaped = False

print("TREASURE CAVE")
print("Explore three rooms. Escape before your energy runs out!")
print("Type left or right. Type quit to stop.")

while energy > 0 and not escaped:
    print("\nEnergy:", energy, "Treasure:", treasure)
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
