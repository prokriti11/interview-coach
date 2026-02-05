# AI Interview Coach 🎯

An intelligent mock interview platform with voice recording and performance analytics.

## Features

- 🎤 **Voice Recording**: Practice speaking your answers with live speech-to-text
- 📊 **Performance Dashboard**: Track progress, confidence scores, and improvement trends
- 🤖 **AI-Powered Feedback**: Get constructive feedback on every answer
- 📈 **Analytics**: Filler word detection and confidence scoring
- 🌓 **Dark/Light Mode**: Beautiful UI with theme switching
- 💾 **Session History**: Review past interviews and export reports

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## Deploy to Netlify

### Option 1: Drag & Drop (Easiest)
1. Run `npm run build`
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag the `build` folder onto Netlify
4. Done! 🎉

### Option 2: Netlify CLI
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify deploy --prod`
3. Follow the prompts

### Option 3: Git Deploy
1. Push this code to GitHub
2. Connect your GitHub repo to Netlify
3. Netlify will auto-deploy on every push

## Usage

1. Tell the AI what role you're preparing for
2. Answer interview questions (type or use voice recording)
3. Get instant feedback and track your progress
4. Review analytics in the dashboard
5. Export reports to track improvement

## Technologies

- React 18
- Anthropic Claude API
- Web Speech API
- Lucide Icons

