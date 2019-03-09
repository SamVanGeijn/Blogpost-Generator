import markovify

with open("../Scraper/nl.txt") as f:
    nlText = f.read()

text_model = markovify.NewlineText(nlText)

text = ''
for i in range(50):
    text += text_model.make_sentence() + '\n'

print(text)