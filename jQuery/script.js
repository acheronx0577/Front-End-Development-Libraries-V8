// jQuery Learning Playground
$(document).ready(function() {
    // State management
    let currentLesson = null;
    let isRunning = false;

    // DOM elements
    const $runBtn = $('#runCode');
    const $resetBtn = $('#resetCode');
    const $exampleBtn = $('#showExample');
    const $codeInput = $('#jqueryCode');
    const $output = $('#output');
    const $result = $('#result');
    const $editorStatus = $('#editorStatus');
    const $outputStatus = $('#outputStatus');
    const $globalStatus = $('#globalStatus');
    const $currentLesson = $('#currentLesson');
    const $lessonInfo = $('#lessonInfo');
    const $lessonCards = $('.lesson-card');

    // Lesson data
    const lessons = {
        1: {
            title: "Selecting Elements",
            description: "Learn how to select DOM elements using jQuery selectors.",
            examples: [
                "$('#target1') // Select by ID",
                "$('.target') // Select by class",
                "$('button') // Select by tag name"
            ],
            challenge: "Select #target1 and change its text to 'Hello jQuery!'",
            solution: "$('#target1').text('Hello jQuery!');"
        },
        2: {
            title: "Modifying CSS",
            description: "Learn how to change CSS styles using jQuery.",
            examples: [
                "$('#target1').css('color', 'red')",
                "$('.box').css('background', 'blue')",
                "$('#target2').css({'padding': '20px', 'border': '2px solid yellow'})"
            ],
            challenge: "Change the background color of #target2 to purple",
            solution: "$('#target2').css('background', 'purple');"
        },
        3: {
            title: "Animations & Effects",
            description: "Learn how to create animations and visual effects.",
            examples: [
                "$('#target1').hide(1000)",
                "$('#target2').show(500)",
                "$('.box').fadeOut(800)",
                "$('#target3').slideUp(600)"
            ],
            challenge: "Make #target3 fade out slowly",
            solution: "$('#target3').fadeOut(2000);"
        },
        4: {
            title: "Event Handling",
            description: "Learn how to handle user interactions like clicks.",
            examples: [
                "$('#target1').click(function() { alert('Clicked!'); })",
                "$('#actionBtn').on('mouseenter', function() { $(this).css('background', 'orange'); })",
                "$('#textInput').keyup(function() { console.log($(this).val()); })"
            ],
            challenge: "Make a button change color when clicked",
            solution: "$('#actionBtn').click(function() { $(this).css('background', 'green'); });"
        }
    };

    // Initialize the playground
    function init() {
        updateStatus('READY', 'success');
        bindEvents();
        console.log("jQuery Learning Playground Initialized");
    }

    // Bind event listeners
    function bindEvents() {
        // Lesson selection
        $lessonCards.on('click', function() {
            const lessonId = $(this).data('lesson');
            selectLesson(lessonId);
        });

        // Code execution
        $runBtn.on('click', executeCode);
        
        // Reset playground
        $resetBtn.on('click', resetPlayground);
        
        // Show example
        $exampleBtn.on('click', showExample);
        
        // Enter key to run code
        $codeInput.on('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                executeCode();
            }
        });

        // Demo event handlers for playground elements
        $('#actionBtn').on('click', function() {
            showMessage('Button clicked! Try handling this with jQuery.', 'info');
        });

        $('#textInput').on('input', function() {
            // Demo input handling
        });
    }

    // Select a lesson
    function selectLesson(lessonId) {
        currentLesson = lessonId;
        const lesson = lessons[lessonId];
        
        // Update UI
        $lessonCards.removeClass('active');
        $(`.lesson-card[data-lesson="${lessonId}"]`).addClass('active');
        
        // Update lesson info
        $lessonInfo.html(`
            <h4>${lesson.title}</h4>
            <p>${lesson.description}</p>
            <p><strong>Challenge:</strong> ${lesson.challenge}</p>
            <div class="examples">
                <strong>Examples:</strong>
                ${lesson.examples.map(exp => `<div><code>${exp}</code></div>`).join('')}
            </div>
        `);
        
        // Update footer
        $currentLesson.text(lesson.title);
        $globalStatus.text('LESSON_ACTIVE');
        
        showMessage(`Lesson loaded: ${lesson.title}`, 'success');
    }

    // Execute jQuery code
    function executeCode() {
        const code = $codeInput.val().trim();
        
        if (!code) {
            showMessage('Please enter some jQuery code to execute.', 'error');
            return;
        }

        if (isRunning) {
            showMessage('Please wait for current execution to complete.', 'warning');
            return;
        }

        isRunning = true;
        updateStatus('EXECUTING', 'warning');
        
        try {
            // Store original console.log
            const originalLog = console.log;
            let output = '';
            
            // Override console.log to capture output
            console.log = function(...args) {
                output += args.join(' ') + '\n';
                originalLog.apply(console, args);
            };
            
            // Execute the code
            const result = eval(code);
            
            // Restore console.log
            console.log = originalLog;
            
            // Display results
            displayResult(code, result, output);
            updateStatus('SUCCESS', 'success');
            
        } catch (error) {
            displayError(code, error);
            updateStatus('ERROR', 'error');
        } finally {
            isRunning = false;
        }
    }

    // Display execution result
    function displayResult(code, result, output) {
        let resultHtml = `
            <div class="execution-result success">
                <div class="result-header">
                    <span class="result-icon">✅</span>
                    <span class="result-title">CODE_EXECUTED_SUCCESSFULLY</span>
                </div>
                <div class="code-preview">
                    <strong>Executed:</strong>
                    <code>${escapeHtml(code)}</code>
                </div>
        `;
        
        if (output) {
            resultHtml += `
                <div class="console-output">
                    <strong>Console Output:</strong>
                    <pre>${escapeHtml(output)}</pre>
                </div>
            `;
        }
        
        if (result !== undefined) {
            resultHtml += `
                <div class="return-value">
                    <strong>Return Value:</strong>
                    <code>${escapeHtml(String(result))}</code>
                </div>
            `;
        }
        
        resultHtml += `</div>`;
        $result.html(resultHtml);
        $output.addClass('active');
    }

    // Display execution error
    function displayError(code, error) {
        const resultHtml = `
            <div class="execution-result error">
                <div class="result-header">
                    <span class="result-icon">❌</span>
                    <span class="result-title">EXECUTION_ERROR</span>
                </div>
                <div class="code-preview">
                    <strong>Code:</strong>
                    <code>${escapeHtml(code)}</code>
                </div>
                <div class="error-message">
                    <strong>Error:</strong>
                    <code>${escapeHtml(error.message)}</code>
                </div>
                <div class="error-help">
                    <strong>Tip:</strong> Check your jQuery syntax and make sure elements exist.
                </div>
            </div>
        `;
        
        $result.html(resultHtml);
        $output.addClass('active');
    }

    // Show example code
    function showExample() {
        if (!currentLesson) {
            showMessage('Please select a lesson first.', 'warning');
            return;
        }
        
        const lesson = lessons[currentLesson];
        $codeInput.val(lesson.solution);
        showMessage('Example code loaded. Click "RUN_CODE" to see it in action!', 'info');
    }

    // Reset playground
    function resetPlayground() {
        // Reset all playground elements
        $('.playground-element').each(function() {
            const $el = $(this);
            const id = $el.attr('id');
            
            // Reset based on element type
            if ($el.is('button')) {
                $el.text('#' + id);
                $el.css({
                    'background': '',
                    'color': '',
                    'border': '',
                    'padding': '',
                    'opacity': '',
                    'display': ''
                });
            } else if ($el.is('.box')) {
                $el.text('.' + id);
                $el.css({
                    'background': '',
                    'color': '',
                    'border': '',
                    'width': '',
                    'height': '',
                    'opacity': '',
                    'display': ''
                });
            } else if ($el.is('input')) {
                $el.val('');
                $el.css({
                    'background': '',
                    'color': '',
                    'border': ''
                });
            }
            
            // Remove any added classes
            $el.removeClass('animated bounce flash pulse rubberBand shake headShake swing tada wobble jello bounceIn');
        });
        
        // Clear code and output
        $codeInput.val('');
        $result.html(`
            <div class="welcome-message">
                <div class="welcome-icon">🔄</div>
                <div class="welcome-text">
                    <h3>Playground Reset!</h3>
                    <p>All elements have been restored to their original state.</p>
                    <p>Ready for more jQuery experiments!</p>
                </div>
            </div>
        `);
        
        $output.removeClass('active');
        updateStatus('READY', 'success');
        showMessage('Playground has been reset successfully.', 'success');
    }

    // Utility functions
    function updateStatus(status, type) {
        $editorStatus.text(status).removeClass('success error warning').addClass(type);
        $outputStatus.text(status);
    }

    function showMessage(message, type = 'info') {
        // Create temporary message
        const messageHtml = `
            <div class="message ${type}">
                <span class="message-icon">${getIcon(type)}</span>
                <span class="message-text">${message}</span>
            </div>
        `;
        
        $result.html(messageHtml);
        $output.addClass('active');
        
        // Auto-remove after 3 seconds if it's just an info message
        if (type === 'info') {
            setTimeout(() => {
                if ($result.find('.message').length) {
                    $result.html(`
                        <div class="welcome-message">
                            <div class="welcome-icon">💡</div>
                            <div class="welcome-text">
                                <h3>Ready to Code!</h3>
                                <p>Write your jQuery code above and click RUN_CODE to see the magic!</p>
                            </div>
                        </div>
                    `);
                }
            }, 3000);
        }
    }

    function getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '💡'
        };
        return icons[type] || '💡';
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Pre-populate with a simple example
    function loadWelcomeExample() {
        $codeInput.val(`// Welcome to jQuery Learning Playground!
// Try this example to get started:

$('#target1').css('background', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
$('#target1').text('jQuery Rocks!');`);
    }

    // Initialize the application
    init();
    loadWelcomeExample();

    // Global function for advanced users
    window.jQueryPlayground = {
        reset: resetPlayground,
        runCode: executeCode,
        loadLesson: selectLesson
    };
});