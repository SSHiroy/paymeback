# PayMeBack

An app that helps scan receipts, calculate how much each person owes and generates individual PayNow QR codes for them to scan and pay. It is fast, simple and compliant with Singapore's PayNow QR standard.

## Features
### Receipt Parser
#### Key Features
It parses text extracted from receipt images (via Optical Character Recognition - OCR) and attempts to identify product descriptions and their corresponding prices. It then structures this information into a `BillForm` object and saves it as a JSON file.
- Utilises `react-native-mlkit-ocr` to extract text from an image URI
- Filters text elements to identify potential prices using regular expressions

### Payment Generator
#### Key Features
It processes receipt information and calculates how much each person owes. It takes a structured bill form, iterates through products and the people associated with each product, and calculates the amounts to be paid per person.
- Calculates the total amount owed by each person for shared products.
- Handles products assigned to multiple people.

### QR Code Generator
It offers utility to generate EMVCo-compatible QR code payloads for PayNow transactions in Singapore, allowing the user to create QR codes that can be scanned by banking apps to initiate payments.
#### KEy Features
- Generates PayNow QR payloads for payments to valid Singapore mobile numbers.
- Supports specifying the payment amount
- Allows adding a short note (reference) to the transaction
- Sets an expiry date for the QR code (defaults to 7 days)
- Calculates the CRC16-CCITT-FALSE checksum for the payload

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
