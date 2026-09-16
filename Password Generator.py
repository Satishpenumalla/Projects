#Random Password Generator

#This script generates a random password that includes at least one digit, 
# one special character, and a mix of letters.

import random, string

letters = string.ascii_letters
digits = string.digits
special_chars = "!@#$%^&*_+-="

pw = random.choice(digits)
pw+= random.choice(special_chars)
pw += "".join(random.choices(letters, k = 6 ))

final_pw = "".join(random.sample(pw, 8))
print(final_pw)

