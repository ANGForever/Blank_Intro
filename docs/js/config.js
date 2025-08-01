/**
 * Resume Renderer Example Configuration File
 * ------------------------------------------
 * This file serves as a template for configuring your resume.
 * Modify the values below to customize the appearance, content source,
 * and behavior of your rendered resume.
 *
 * Instructions:
 * 1. Rename this file to `config.js` in the `js/` directory.
 * 2. Update `resume_example.md` with your resume content, or point
 *    `site.markdownFile` to your own Markdown file.
 * 3. Customize the settings below to your liking.
 */

const resumeConfig = {
  // === BASIC SITE INFORMATION ===
  site: {
    title: "Your Name | Professional Title",         // Appears in the browser tab
    description: "A brief description of Your Name and their resume.", // For SEO and social sharing
    mainWebsite: "https://your-website.com",         // Link to your main personal or professional website
    websiteLinkText: "Visit My Website",             // Text for the link in the top-right corner
    markdownFile: "resume.md",               // Path to your Markdown resume file (relative to index.html)
    favicon: "favicon.ico",            // Path to your website icon (e.g., .ico, .png)
  },
  
  // === THEME AND STYLES ===
  theme: {
    colors: {
      primary: "#3498db",                      // Main theme color (e.g., for links, highlights)
      accent: "rgba(52, 152, 219, 0.85)",      // Accent color (often a variation of primary)
      accentLight: "rgba(52, 152, 219, 0.15)",  // Lighter version of accent (e.g., for backgrounds)
      background: "#ffffff",                   // Page background color
      text: "#333333",                         // Main text color
      secondaryText: "#555555",                // Secondary text color (e.g., for dates, subtitles)
      borderColor: "#dddddd",                  // Border color for elements
      shadowColor: "rgba(0, 0, 0, 0.1)"        // Shadow color for cards or sections
    },
    fonts: {
      // Main font stack for the resume
      main: `"Helvetica Neue", Helvetica, Arial, sans-serif`, 
      // URL for Google Fonts (if you want to use them). Leave empty if not using Google Fonts.
      // Example: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap"
      googleFonts: "" 
    }
  },
  
  // === SPECIAL SECTION RENDERING ===
  // Configure how specific sections (identified by their H3 titles in Markdown) are rendered.
  sections: {
    specialSections: {
      // Example: Configuration for a "Skills" section
      "Skills": { // This MUST match the H3 title in your Markdown (e.g., "### Skills")
        type: "skills",                             // Special rendering type for skills
        skillTagsTitle: "Technical Proficiencies",  // This H4 title within "Skills" section triggers skill icon generation
        container: "skills-showcase-container",     // Custom CSS class for the skills section container
        itemClass: "skill-category-group",          // Custom CSS class for each skill group (under H4)
        useSkillIcons: true,                        // Set to true to use skillicons.dev for skills listed under skillTagsTitle
        skillIconsConfig: {
          theme: "light",                           // "light" or "dark" theme for skillicons.dev
          perline: 10,                              // Number of icons per line
          // Optional: Map custom skill names in Markdown to skillicons.dev icon IDs
          // Example: skillMap: { "JavaScript ES6+": "js", "NodeJS": "nodejs" }
          skillMap: {} 
        }
      },
      // Example: Configuration for an "Awards" or "Honors" section
      "Awards and Recognition": { // This MUST match the H3 title in your Markdown (e.g., "### Awards and Recognition")
        type: "awards",                             // Special rendering type for awards
        container: "achievements-gallery-container",// Custom CSS class for the awards section container
        itemClass: "award-highlight-item"           // Custom CSS class for each award item
      }
      // Add more special sections here if needed, following the pattern above.
    },
    // Default CSS class for items within general sections (not defined in specialSections)
    // These are applied to divs wrapping content under H4 titles.
    itemClassBySection: { 
      "Education": "education-entry",
      "Experience": "job-role",
      // Add other H3 titles and their desired item classes here
      "default": "content-item" // Default class if no specific H3 match is found
    }
  },
  
  // === MARKDOWN PARSING CUSTOMIZATION ===
  // Define custom Markdown comment-based markers for special formatting.
  markdownParsing: {
    markers: {
      // For time periods (e.g., education dates, job durations)
      period: { 
        start: "<!-- period -->",           // Start marker for a time period
        end: "<!-- /period -->",            // End marker for a time period
        outputClass: "timeline-date"        // CSS class applied to the rendered period
      },
      // For lists of skills to be potentially processed by skillicons.dev (if useSkillIcons is true for the section)
      skillTags: { 
        start: "<!-- skills -->",           // Start marker for a block of skill tags
        end: "<!-- /skills -->",            // End marker for a block of skill tags
        outputClass: "skill-tag-list"       // CSS class applied to the container of these skills (before icon processing)
      },
      // For defining section types directly in Markdown (advanced, usually not needed if using H3 titles for specialSections)
      sectionType: { 
        start: "<!-- section-type: ",
        end: " -->",
        closeTag: "<!-- /section-type -->" // Optional closing tag for clarity
      },
      // For individual award items
      award: { 
        start: "<!-- award -->",            // Start marker for an award item
        end: "<!-- /award -->",             // End marker for an award item
        dateStart: "<!-- date -->",         // Start marker for the award date
        dateEnd: "<!-- /date -->"           // End marker for the award date
      }
    }
  },
  
  // === FOOTER CONFIGURATION ===
  footer: {
    logo: "YN", // Your initials or a short logo text for the footer
    links: [ // Links to display in the footer
      { text: "GitHub", url: "https://github.com/yourusername", target: "_blank" },
      { text: "LinkedIn", url: "https://linkedin.com/in/yourprofile", target: "_blank" }
      // Add more links as needed
    ],
    copyright: {
      year: new Date().getFullYear().toString(), // Automatically uses the current year
      name: "Your Name",                         // Your name for the copyright notice
      url: "https://your-website.com",           // Link for your name in the copyright
      text: "All rights reserved."               // Copyright text
    },
    tagline: "Crafted with passion and precision.", // A short tagline for the footer
    icp: { // For Chinese ICP license, leave empty if not applicable
      text: "", // Example: "京ICP备XXXXXXXX号-X"
      url: ""   // Example: "https://beian.miit.gov.cn/"
    }
  },
  
  // === FEATURE TOGGLES ===
  features: {
    backToTop: true,                          // Enable or disable the "Back to Top" button
    animations: true,                         // Enable or disable subtle animations
    backgroundDecoration: true                // Enable or disable fixed background decoration elements
  },
  
  // === ANALYTICS CONFIGURATION ===
  analytics: {
    // Google Analytics (Google Tag ID) - leave empty to disable
    // Example: "G-XXXXXXXXXX"
    googleTagId: "", 
    // Umami Analytics (Website ID) - leave empty to disable
    // Example: "your-umami-website-id"
    umamiWebsiteId: "" 
  }
};

// Export configuration for use by main.js
// This ensures 'resumeConfig' is available in the global scope (window.resumeConfig)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = resumeConfig; // For Node.js environments (e.g., testing)
} else {
  window.resumeConfig = resumeConfig; // For browser environments
}
