# 204xKuroba - Subnet Calculator

A powerful web-based IPv4 and IPv6 subnet calculator tool built with Next.js and React.

## Features

- **IPv4 & IPv6 Support**: Calculate subnets for both IPv4 (32-bit) and IPv6 (128-bit) networks
- **Automatic Subnet Division**: Automatically divide networks to a target prefix length
- **Interactive Subnet Splitting**: Click "Divide" to recursively split subnets, "Join" to merge them back
- **Column Toggles**: Customize which columns to display (Subnet Address, Netmask, Range, Useable IPs, Hosts, etc.)
- **Network Validation**: Automatic correction of invalid network addresses with warning notifications
- **Export to Excel**: Export all calculated subnets to an Excel file for further analysis
- **Dark Theme**: Modern dark interface with green accents for easy on-the-eyes viewing
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/204xkuroba.git
cd 204xkuroba
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Basic Subnet Calculation
1. Enter a network address (e.g., 192.168.0.0)
2. Enter the prefix length (e.g., 16 for /16)
3. Optionally enter a target prefix length to automatically divide
4. Click "Update" to calculate

### Dividing Subnets
- Click the "Divide" button next to any subnet to split it into two equal subnets
- Each divided subnet can be further divided until reaching /31 (IPv4) or /127 (IPv6)

### Joining Subnets
- Click the "Join" button to merge a subnet back to its parent

### Exporting Results
- Click the "Export" button to download all visible subnets as an Excel file
- The file will include only the columns you've enabled via checkboxes

### Toggling Columns
- Use the checkboxes to show/hide columns:
  - Subnet address
  - Netmask
  - Range of addresses
  - Useable IPs
  - Hosts count
  - Divide/Join buttons

## Tech Stack

- **Frontend**: React 19+, Next.js 16+
- **Styling**: Tailwind CSS v4
- **Excel Export**: XLSX library
- **Deployment**: Vercel (recommended)

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub:
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Click "Deploy"
6. Your site will be live at `https://your-project.vercel.app`

### Deploy to Other Platforms

- Netlify, Railway, Render, or any Node.js hosting service
- Follow their respective GitHub integration guides

## License

MIT License - feel free to use this project for personal or commercial purposes

## Support

For issues or feature requests, please open an issue on GitHub.

---

Made with by 204xKuroba Team
