$(document).ready(function() {
    let totalClicks = 0;
    let lastTarget = 'none';
    
    // Update statistics display
    function updateStats() {
        $('#total-clicks').text(totalClicks);
        $('#footer-clicks').text(totalClicks);
        $('#last-target').text(lastTarget);
    }
    
    // Generate button HTML example
    function generateButtonHTML(buttonId) {
        return `&lt;button class="btn btn-default target" id="${buttonId}"&gt;#${buttonId}&lt;/button&gt;`;
    }
    
    // Button click handler with simplified feedback
    $('.target').click(function() {
        const buttonId = $(this).attr('id');
        const well = $(this).closest('.well');
        const wellId = well.attr('id');
        
        // Update counters
        totalClicks++;
        lastTarget = buttonId;
        
        // Update stats
        updateStats();
        
        // Remove any existing notifications in this well
        well.find('.click-notification, .code-output').remove();
        
        // Create simplified notification
        const notification = $(`
            <div class="click-notification">
                🔥 ${buttonId.toUpperCase()} ACTIVATED
            </div>
            <div class="code-output">${generateButtonHTML(buttonId)}</div>
        `);
        
        // Add notification to the well (after the buttons)
        well.append(notification);
        
        // Visual feedback for clicked button
        $(this).css({
            'background': 'linear-gradient(135deg, var(--accent-success) 0%, var(--accent-cyan) 100%)',
            'border-color': 'var(--accent-success)',
            'transform': 'scale(0.95)',
            'color': 'var(--bg-primary)',
            'font-weight': '700'
        });
        
        // Dim other buttons in the same well
        well.find('.target').not(this).css('opacity', '0.6');
        
        // Console log
        console.log(`[EVENT] ${buttonId} activated in ${wellId}`);
        
        // Reset after delay
        setTimeout(() => {
            // Reset clicked button
            $(this).css({
                'background': '',
                'border-color': '',
                'transform': '',
                'color': '',
                'font-weight': ''
            });
            
            // Reset other buttons
            well.find('.target').css('opacity', '1');
            
            // Remove notification after some time
            setTimeout(() => {
                notification.fadeOut(500, function() {
                    $(this).remove();
                });
            }, 3000);
            
        }, 1000);
    });
    
    // Well hover effects
    $('.well').hover(
        function() {
            $(this).css('border-color', 'var(--accent-info)');
        },
        function() {
            $(this).css('border-color', 'var(--border-primary)');
        }
    );
    
    // Button hover effects
    $('.target').hover(
        function() {
            if (!$(this).css('background').includes('var(--accent-success)')) {
                $(this).css({
                    'border-color': 'var(--accent-purple)',
                    'transform': 'translateY(-2px)'
                });
            }
        },
        function() {
            if (!$(this).css('background').includes('var(--accent-success)')) {
                $(this).css({
                    'border-color': '',
                    'transform': ''
                });
            }
        }
    );
    
    // Initialize stats
    updateStats();
    
    console.log("jQuery Playground TUI initialized");
    console.log("Click buttons to see their HTML structure!");
});