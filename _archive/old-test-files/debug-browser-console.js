// Browser Console Debug Script for Network Filtering Issue
// Copy and paste this into browser console when on dashboard

console.log('🔍 Starting network filtering debug...');

// First, let's check what shows are available
const dashboardElement = document.querySelector('[data-testid="dashboard-grid"]') || document.querySelector('.dashboard-grid') || document.querySelector('main');

if (dashboardElement) {
  console.log('✅ Dashboard element found');
  
  // Look for show cards
  const showCards = document.querySelectorAll('[data-show-name]') || 
                   document.querySelectorAll('[data-testid*="show"]') || 
                   document.querySelectorAll('.show-card');
  
  console.log(`📺 Found ${showCards.length} show cards`);
  
  showCards.forEach((card, index) => {
    const showName = card.getAttribute('data-show-name') || 
                    card.querySelector('h3, h2, .title')?.textContent ||
                    card.textContent?.split('\n')[0];
    console.log(`${index + 1}. ${showName}`);
  });
} else {
  console.log('❌ Dashboard element not found');
}

// Now test network filter dropdown
const networkFilter = document.querySelector('select[data-testid="network-filter"]') || 
                     document.querySelector('select') ||
                     document.querySelector('[class*="network"]') ||
                     document.querySelector('[placeholder*="Network"]');

if (networkFilter) {
  console.log('✅ Network filter found:', networkFilter);
  
  // Get all options
  const options = networkFilter.querySelectorAll('option');
  console.log(`🎯 Network filter options (${options.length}):`);
  options.forEach((option, index) => {
    console.log(`  ${index}: "${option.value}" - "${option.textContent}"`);
  });
  
  // Test Amazon filtering
  console.log('\n🧪 Testing Amazon filtering...');
  
  // Try to find Amazon option
  const amazonOption = Array.from(options).find(opt => 
    opt.value.includes('prime') || 
    opt.value.includes('amazon') ||
    opt.textContent.toLowerCase().includes('prime') ||
    opt.textContent.toLowerCase().includes('amazon')
  );
  
  if (amazonOption) {
    console.log(`✅ Found Amazon option: "${amazonOption.value}" - "${amazonOption.textContent}"`);
    
    // Simulate selecting it
    networkFilter.value = amazonOption.value;
    networkFilter.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
      const remainingCards = document.querySelectorAll('[data-show-name]') || 
                           document.querySelectorAll('[data-testid*="show"]') || 
                           document.querySelectorAll('.show-card');
      
      console.log(`📊 After Amazon filter: ${remainingCards.length} shows remaining`);
      
      remainingCards.forEach((card, index) => {
        const showName = card.getAttribute('data-show-name') || 
                        card.querySelector('h3, h2, .title')?.textContent ||
                        card.textContent?.split('\n')[0];
        console.log(`  ${index + 1}. ${showName}`);
      });
    }, 1000);
    
  } else {
    console.log('❌ No Amazon option found in network filter');
  }
  
} else {
  console.log('❌ Network filter not found');
}

// Check if we can access React component state
if (window.React) {
  console.log('✅ React detected - looking for component state...');
  
  // Try to access component via React DevTools
  const reactRoot = document.querySelector('#root');
  if (reactRoot && reactRoot._reactInternalFiber) {
    console.log('✅ React internal fiber found');
  }
}

console.log('🏁 Debug script complete. Check network tab for API calls.');
console.log('💡 Open React DevTools and look for dashboard component state.');