## Aharshuddhi
### An app to easily check ingredient lists for non-edible items.
---
This basic app, made with React Native, is meant to check ingredient lists for items we can't eat as satsangis. Instead of tediously reading through ingredients on every product, the app uses a pre-trained ML text-recognition model to analyze a picture of the ingredients and search for blacklisted words (ingredients).

Future features include:
- A better OCR / text-recognition model (currently running on ocr.space's API)
- Customizable blacklists (for food/medicine allergies, etc)
- Saving already scanned products in a database
- User logins and auth to save your blacklist and previous items in the cloud