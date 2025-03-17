module.exports = async ({github, context}) => {  
  const { data: items } = await github.rest.issues.listForRepo({  
    owner: context.repo.owner,  
    repo: context.repo.repo,  
    state: 'all',  
    per_page: 100,  
  });  
  
  const roadmap = { complete: [], underConstruction: [], inRoadmap: [] };  
  
  for (const item of items) {  
    // Handle merged pull requests  
    if (item.pull_request) {  
      if (item.merged_at) {  
        roadmap.complete.push({  
          title: item.title,  
          url: item.html_url,  
          number: item.number  
        });  
      }  
      continue;  
    }  
  
    // Skip closed issues  
    if (item.state === 'closed') continue;  
  
    // Skip bug/docs labeled issues  
    const labels = item.labels.map(label => label.name.toLowerCase());  
    if (labels.includes('bug') || labels.includes('docs')) continue;  
  
    // Categorize open issues  
    if (item.assignees?.length > 0) {  
      roadmap.underConstruction.push({  
        title: item.title,  
        url: item.html_url,  
        number: item.number  
      });  
    } else {  
      roadmap.inRoadmap.push({  
        title: item.title,  
        url: item.html_url,  
        number: item.number  
      });  
    }  
  }  
  
  // Generate markdown content  
  let content = '# Project Roadmap\n\n';  
    
  content += '## Complete ✅\n';  
  content += roadmap.complete.length > 0   
    ? roadmap.complete.map(i => `- [${i.title}](${i.url})`).join('\n')  
    : 'No completed items\n';  
    
  content += '\n\n## Under Construction 🚧\n';  
  content += roadmap.underConstruction.length > 0   
    ? roadmap.underConstruction.map(i => `- [${i.title}](${i.url})`).join('\n')   
    : 'No items in progress\n';  
    
  content += '\n\n## In the Roadmap 📅\n';  
  content += roadmap.inRoadmap.length > 0   
    ? roadmap.inRoadmap.map(i => `- [${i.title}](${i.url})`).join('\n')   
    : 'No upcoming items\n';  
  
  // Write to file  
  const fs = require('fs');  
  fs.writeFileSync('ROADMAP.md', content);  
};  
