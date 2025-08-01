document.addEventListener("DOMContentLoaded", () => {
  // 获取配置
  const config = window.resumeConfig || {};
  
  // 应用基本站点信息
  applySiteInfo(config.site);

  // 应用主题配置到CSS变量
  applyTheme(config.theme);

  // 应用分析配置
  applyAnalytics(config.analytics);

  // 回到顶部按钮
  if (config.features?.backToTop !== false) { // Added optional chaining for features
    setupBackToTop();
  }

  // Markdown渲染功能
  const markdownContainer = document.getElementById("markdown-content");

  // 配置marked选项
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false,
  });

  // 自定义渲染器
  const renderer = new marked.Renderer();

  // 自定义标题渲染
  renderer.heading = function (text, level) {
    if (level === 1) {
      return `<header><h1>${text}</h1></header>`;
    }
    return `<h${level}>${text}</h${level}>`;
  };

  // 保留HTML注释
  renderer.html = function (html) {
    return html;
  };

  // 应用渲染器
  marked.use({ renderer });

  // 加载并渲染Markdown文件
  const markdownFile = config.site?.markdownFile || "resume.md";
  fetch(markdownFile)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`无法加载Markdown文件: ${markdownFile}`);
      }
      return response.text();
    })
    .then((markdown) => {
      // 预处理Markdown
      const processedMarkdown = preprocessMarkdown(markdown, config.markdownParsing);

      // 解析Markdown
      let parsedContent = marked.parse(processedMarkdown);

      // 后处理：修复可能被错误包裹在 <pre><code> 中的奖项HTML
      // 这个正则表达式会查找 <pre><code> 包裹的，并且内部看起来像是我们生成的 award-item 结构的内容
      const preCodeAwardPattern = /<pre><code>([\s\S]*?<div class="award-item">[\s\S]*?<\/div>[\s\S]*?)<\/code><\/pre>/gi;
      parsedContent = parsedContent.replace(preCodeAwardPattern, (match, innerHtml) => {
        // 将转义的HTML标签还原
        return innerHtml.replace(/</g, '<').replace(/>/g, '>');
      });

      // 将内容分为主要部分
      const parts = parsedContent.split("<h2>");

      // 提取介绍部分
      let introContent = `<section class="intro">${parts[0]}</section>`;

      // 处理专业资料部分
      let resumeContent = "";
      if (parts.length > 1) {
        resumeContent = `<section class="resume"><h2>${parts.slice(1).join("<h2>")}</section>`;
      }

      // 添加页脚
      const footerContent = generateFooter(config.footer);
      
      // 组合所有内容
      markdownContainer.innerHTML = introContent + resumeContent + footerContent;

      // 处理特殊部分
      processSpecialSections(config.sections);
    })
    .catch((error) => {
      console.error("加载Markdown失败:", error);
      markdownContainer.innerHTML = `<p class="error">无法加载简历内容。错误: ${error.message}</p>`;
    });
    
  // 设置回到顶部按钮
  function setupBackToTop() {
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
      backToTop.style.opacity = "0";

      window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
          backToTop.style.opacity = "1";
        } else {
          backToTop.style.opacity = "0";
        }
      });

      backToTop.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }
  }

  // 应用基本站点信息
  function applySiteInfo(siteConfig = {}) {
    if (siteConfig.title) {
      document.title = siteConfig.title;
    }
    if (siteConfig.description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", siteConfig.description);
      }
    }
    if (siteConfig.favicon) {
      let faviconLink = document.querySelector("link[rel*='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.setAttribute('rel', 'shortcut icon');
        document.head.appendChild(faviconLink);
      }
      faviconLink.setAttribute('href', siteConfig.favicon);
    }

    // Google Fonts
    const themeFonts = window.resumeConfig?.theme?.fonts;
    if (themeFonts?.googleFonts) {
      let googleFontsLink = document.querySelector("link[href*='fonts.googleapis.com']");
      if (googleFontsLink) {
        googleFontsLink.setAttribute("href", themeFonts.googleFonts);
      } else {
        googleFontsLink = document.createElement('link');
        googleFontsLink.setAttribute('rel', 'stylesheet');
        googleFontsLink.setAttribute('href', themeFonts.googleFonts);
        document.head.appendChild(googleFontsLink);
      }
    }
    
    // Website Link
    const websiteLink = document.querySelector(".website-link");
    if (websiteLink && siteConfig.mainWebsite && siteConfig.websiteLinkText) {
      websiteLink.setAttribute("href", siteConfig.mainWebsite);
      websiteLink.textContent = siteConfig.websiteLinkText;
    }
  }

  // 应用分析配置
  function applyAnalytics(analyticsConfig = {}) {
    // Google Analytics
    if (analyticsConfig.googleTagId) {
      const gaScript = Array.from(document.scripts).find(s => s.src.includes('googletagmanager.com'));
      if (gaScript) {
        // 更新已存在的脚本中的ID
        const newGaSrc = `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.googleTagId}`;
        if (gaScript.src !== newGaSrc) {
            gaScript.src = newGaSrc; // 更新src
             // 重新初始化gtag配置
            const gaInitScript = Array.from(document.scripts).find(s => s.textContent.includes("gtag('config'"));
            if (gaInitScript) {
                gaInitScript.textContent = `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${analyticsConfig.googleTagId}');
                `;
            }
        }
      } else {
        // 添加新的GA脚本
        const newGaScript = document.createElement('script');
        newGaScript.async = true;
        newGaScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.googleTagId}`;
        document.head.appendChild(newGaScript);

        const newGaInitScript = document.createElement('script');
        newGaInitScript.textContent = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsConfig.googleTagId}');
        `;
        document.head.appendChild(newGaInitScript);
      }
    }

    // Umami Analytics
    if (analyticsConfig.umamiWebsiteId) {
      const umamiScript = Array.from(document.scripts).find(s => s.src.includes('cloud.umami.is'));
      if (umamiScript) {
        umamiScript.setAttribute('data-website-id', analyticsConfig.umamiWebsiteId);
      } else {
        const newUmamiScript = document.createElement('script');
        newUmamiScript.defer = true;
        newUmamiScript.src = "https://cloud.umami.is/script.js"; // Umami script URL is usually fixed
        newUmamiScript.setAttribute('data-website-id', analyticsConfig.umamiWebsiteId);
        document.head.appendChild(newUmamiScript);
      }
    }
  }

  // 应用主题配置
  function applyTheme(theme = {}) {
    if (!theme || !theme.colors) return;
    
    const root = document.documentElement;
    const colors = theme.colors;
    
    // 设置CSS变量
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(`--${kebabCase(key)}`, value);
    }

    // 设置字体
    if (theme.fonts && theme.fonts.main) {
        root.style.setProperty('--font-main', theme.fonts.main);
    }
  }
  
  // 驼峰转换为kebab-case
  function kebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
  
  // 生成页脚
  function generateFooter(footerConfig = {}) {
    const links = (footerConfig.links || [])
      .map(link => `<a href="${link.url}" ${link.target ? `target="${link.target}" rel="noopener"` : ''}>${link.text}</a>`)
      .join('\n');
      
    const copyright = footerConfig.copyright || {};
    const icp = footerConfig.icp || {};
    
    return `
      <footer>
        <div class="footer-content">
          <div class="footer-logo">${footerConfig.logo || ''}</div>
          <div class="footer-links">
            ${links}
          </div>
        </div>
        <div class="copyright">
          <p>© ${copyright.year || new Date().getFullYear()} <a href="${copyright.url || '#'}" target="_blank" rel="noopener">${copyright.name || ''}</a> • ${copyright.text || ''}</p>
          <p class="made-with">${footerConfig.tagline || ''}</p>
          <p><a href="${icp.url || '#'}" target="_blank" rel="noopener">${icp.text || ''}</a></p>
        </div>
      </footer>
    `;
  }

  // 预处理Markdown，使用配置的标记
  function preprocessMarkdown(md, parsingConfig = {}) {
    const markers = parsingConfig?.markers || {};
    
    // 处理时间段标记
    if (markers.period) {
      const { start, end, outputClass } = markers.period;
      md = md.replace(new RegExp(`${escapeRegExp(start)}(.*?)${escapeRegExp(end)}`, 'g'), 
        `<p class="${outputClass}">$1</p>`);
    }

    // 处理技能标签 - 支持skillicons
    if (markers.skillTags) {
      const { start, end } = markers.skillTags;
      md = md.replace(new RegExp(`${escapeRegExp(start)}\\n([\\s\\S]*?)\\n${escapeRegExp(end)}`, 'gs'), 
        (match, content) => {
          // 保存原始技能标签列表，以便后续处理
          return `<div class="skill-tags" data-skills="${encodeURIComponent(content.trim())}">${content.trim()}</div>`;
        });
    }

    // 处理奖项
    if (markers.award) {
      const { start, end, dateStart, dateEnd } = markers.award;
      md = md.replace(new RegExp(`${escapeRegExp(start)}\\n(🏆|🥈|🌟)\\s*([\\s\\S]*?)${escapeRegExp(end)}`, 'g'), 
        (match, icon, content) => {
          // 提取标题（h4）
          const titleMatch = content.match(/####\s+(.*)/);
          const title = titleMatch ? titleMatch[1].trim() : "";

          // 提取描述
          let description = "";
          if (titleMatch) {
            const afterTitle = content.substring(content.indexOf(titleMatch[0]) + titleMatch[0].length);
            const beforeDate = afterTitle.split(dateStart)[0];
            description = beforeDate.trim();
          }

          // 提取日期
          const dateMatch = content.match(new RegExp(`${escapeRegExp(dateStart)}(.*?)${escapeRegExp(dateEnd)}`));
          const date = dateMatch ? dateMatch[1].trim() : "";

          // Return a compact HTML string without leading/trailing newlines or excessive indentation
          return `<div class="award-item"><span class="award-icon">${icon}</span><div class="award-content"><h4>${title}</h4><p>${description}</p><span class="award-date">${date}</span></div></div>`;
        });
    }

    return md;
  }

  // 转义正则表达式中的特殊字符
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 处理特殊部分
  function processSpecialSections(sectionsConfig = {}) {
    // 基本结构处理
    addBasicStructure(sectionsConfig);
    
    // 处理特殊类型部分
    processCustomSections(sectionsConfig);
  }

  // 添加基本结构
  function addBasicStructure(sectionsConfig) {
    // 部分类名配置
    const itemClasses = sectionsConfig.itemClassBySection || {};
    
    // 处理所有部分
    document.querySelectorAll(".resume h3").forEach((section) => {
      const sectionTitle = section.textContent;
      const sectionDiv = document.createElement("div");
      sectionDiv.className = "resume-section";

      section.parentNode.insertBefore(sectionDiv, section);
      sectionDiv.appendChild(section);

      // 收集相关内容
      let nextElement = sectionDiv.nextSibling;
      while (nextElement && nextElement.tagName !== "H3") {
        const current = nextElement;
        nextElement = nextElement.nextSibling;
        sectionDiv.appendChild(current);
      }

      // 处理项目结构（如教育经历、工作经验等）
      const specialSections = sectionsConfig.specialSections || {};
      if (!specialSections[sectionTitle]) {
        sectionDiv.querySelectorAll("h4").forEach((h4) => {
          // 创建项目容器
          const wrapper = document.createElement("div");

          // 根据部分类型应用类名
          wrapper.className = itemClasses[sectionTitle] || itemClasses.default || "experience-item";

          // 移动h4及相关内容
          h4.parentNode.insertBefore(wrapper, h4);
          wrapper.appendChild(h4);

          // 收集h4直到下一个h4的所有内容
          let next = wrapper.nextSibling;
          while (next && next.tagName !== "H4") {
            const current = next;
            next = next.nextSibling;
            wrapper.appendChild(current);
          }
        });
      }
    });
  }

  // 处理自定义部分类型
  function processCustomSections(sectionsConfig) {
    const specialSections = sectionsConfig.specialSections || {};
    
    // 检查页面中的每个部分
    document.querySelectorAll(".resume-section").forEach(section => {
      const h3 = section.querySelector("h3");
      if (!h3) return;
      
      const sectionTitle = h3.textContent;
      const sectionConfig = specialSections[sectionTitle];
      
      // 如果找到匹配的特殊部分配置
      if (sectionConfig) {
        if (sectionConfig.type === "skills") {
          processSkillsSection(section, sectionConfig);
        } else if (sectionConfig.type === "awards") {
          processAwardsSection(section, sectionConfig);
        }
      }
    });
  }

  // 处理技能部分
  function processSkillsSection(section, config) {
    // 创建技能容器
    const container = document.createElement("div");
    container.className = config.container || "skills-container";

    // 收集所有技能组
    const h4Elements = section.querySelectorAll("h4");
    h4Elements.forEach((h4) => {
      const group = document.createElement("div");
      group.className = config.itemClass || "skill-group";

      // 添加标题
      group.appendChild(h4.cloneNode(true));
      
      // 添加内容直到下一个h4
      let nextEl = h4.nextElementSibling;
      
      // 检查是否需要使用skillicons
      const useSkillIcons = config.useSkillIcons && 
                            h4.textContent === (config.skillTagsTitle || "Programming Languages/Tech Stack");
      const skillIconsConfig = config.skillIconsConfig || {};
      
      while (nextEl && nextEl.tagName !== "H4") {
        // 处理技能标签，如果需要使用skillicons则特殊处理
        if (useSkillIcons && nextEl.classList.contains("skill-tags")) {
          const skillsData = nextEl.getAttribute("data-skills");
          if (skillsData) {
            const skills = decodeURIComponent(skillsData).split("\n")
              .map(skill => skill.trim())
              .filter(skill => skill.length > 0);
            
            // 创建skillicons图片
            const skillIconsContainer = document.createElement("div");
            skillIconsContainer.className = "skill-icons";
            
            // 映射技能名称到图标ID
            const iconIds = skills.map(skill => {
              // 尝试从映射表查找图标ID，如果没有则使用小写技能名
              return skillIconsConfig.skillMap?.[skill] || skill.toLowerCase();
            }).filter(id => id).join(",");
            
            // 创建skillicons图片
            if (iconIds) {
              const theme = skillIconsConfig.theme || "light";
              const perline = skillIconsConfig.perline || 15;
              const img = document.createElement("img");
              img.src = `https://skillicons.dev/icons?perline=${perline}&i=${iconIds}&theme=${theme}`;
              img.alt = "技能图标";
              img.className = "skill-icons-img";
              skillIconsContainer.appendChild(img);
            }
            
            group.appendChild(skillIconsContainer);
          }
        } else {
          // 处理其他内容
          group.appendChild(nextEl.cloneNode(true));
        }
        nextEl = nextEl.nextElementSibling;
      }

      container.appendChild(group);
    });

    // 清理原始元素，保留h3标题
    const h3 = section.querySelector("h3");
    section.innerHTML = "";
    section.appendChild(h3);
    
    // 添加处理后的容器
    section.appendChild(container);
  }

  // 处理奖项部分
  function processAwardsSection(section, config) {
    // 创建奖项容器
    const container = document.createElement("div");
    container.className = config.container || "awards-container";

    // 收集所有奖项
    const awardItems = section.querySelectorAll(".award-item");
    if (awardItems.length > 0) {
      awardItems.forEach((item) => {
        container.appendChild(item.cloneNode(true));
      });

      // 清理原始元素，保留h3标题
      const h3 = section.querySelector("h3");
      section.innerHTML = "";
      section.appendChild(h3);
      
      // 添加处理后的容器
      section.appendChild(container);
    }
  }
});
