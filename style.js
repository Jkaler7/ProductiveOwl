class PomodoroApp {
    constructor() {
        this.currentTime = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.isBreak = false;
        this.interval = null;
        this.studyDuration = 25;
        this.breakDuration = 5;

        
        // Statistics
        this.stats = {
            totalSessions: 0,
            totalTime: 0,
            todayTime: 0,
            lastDate: new Date().toDateString()
        };
        
        // Todo list
        this.todos = [];
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateStats();
        this.renderTodos();
        this.updateProgressRing();
    }
    
    setupEventListeners() {
        // Timer controls
        document.getElementById('startBtn').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetTimer());
        
        // Timer presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            if (btn.id === 'customBtn') {
                btn.addEventListener('click', () => this.showCustomTimer());
            } else {
                btn.addEventListener('click', (e) => {
                    const study = parseInt(e.target.dataset.study);
                    const breakTime = parseInt(e.target.dataset.break);
                    this.setPreset(study, breakTime);
                    this.updatePresetButtons(e.target);
                });
            }
        });
        
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.hideSettings());
        
        // Background selection
        document.querySelectorAll('.bg-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const bg = e.currentTarget.dataset.bg;
                this.changeBackground(bg);
                this.updateBackgroundButtons(e.currentTarget);
            });
        });
        

        
        // Custom timer inputs
        document.getElementById('customStudy').addEventListener('change', (e) => {
            this.studyDuration = parseInt(e.target.value);
            if (!this.isBreak) {
                this.resetTimer();
            }
        });
        
        document.getElementById('customBreak').addEventListener('change', (e) => {
            this.breakDuration = parseInt(e.target.value);
            if (this.isBreak) {
                this.resetTimer();
            }
        });
        
        // Todo list
        document.getElementById('addTodoBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
        
        // Modal close on outside click
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideSettings();
            }
        });
    }
    
    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('pauseBtn').style.display = 'flex';
            
            this.interval = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();
                this.updateProgressRing();
                
                if (this.currentTime <= 0) {
                    this.timerComplete();
                }
            }, 1000);
        }
    }
    
    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.interval);
            document.getElementById('startBtn').style.display = 'flex';
            document.getElementById('pauseBtn').style.display = 'none';
        }
    }
    
    resetTimer() {
        this.pauseTimer();
        this.currentTime = this.isBreak ? this.breakDuration * 60 : this.studyDuration * 60;
        this.totalTime = this.currentTime;
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    timerComplete() {
        this.pauseTimer();
        
        if (!this.isBreak) {
            // Study session completed
            this.stats.totalSessions++;
            this.stats.totalTime += this.studyDuration;
            this.stats.todayTime += this.studyDuration;
            this.updateStats();
            
            this.showNotification('Study session completed! Time for a break 🎉');
            this.switchToBreak();
        } else {
            // Break completed
            this.showNotification('Break time is over! Ready to focus? 💪');
            this.switchToStudy();
        }
        
        this.saveData();
    }
    
    switchToBreak() {
        this.isBreak = true;
        this.currentTime = this.breakDuration * 60;
        this.totalTime = this.currentTime;
        document.getElementById('timerMode').textContent = 'Break Time';
        document.getElementById('timerMode').style.background = 'linear-gradient(135deg, #ff6b9d, #c44569)';
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    switchToStudy() {
        this.isBreak = false;
        this.currentTime = this.studyDuration * 60;
        this.totalTime = this.currentTime;
        document.getElementById('timerMode').textContent = 'Study Session';
        document.getElementById('timerMode').style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    setPreset(study, breakTime) {
        this.studyDuration = study;
        this.breakDuration = breakTime;
        this.resetTimer();
    }
    
    updatePresetButtons(activeBtn) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
    
    showCustomTimer() {
        document.getElementById('customStudy').value = this.studyDuration;
        document.getElementById('customBreak').value = this.breakDuration;
        this.showSettings();
        this.updatePresetButtons(document.getElementById('customBtn'));
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerTime').textContent = timeString;
    }
    
    updateProgressRing() {
        const progress = ((this.totalTime - this.currentTime) / this.totalTime) * 100;
        const circumference = 2 * Math.PI * 85; // radius is 85
        const offset = circumference - (progress / 100) * circumference;
        
        const progressRing = document.querySelector('.progress-ring-progress');
        progressRing.style.strokeDasharray = circumference;
        progressRing.style.strokeDashoffset = offset;
    }
    
    showSettings() {
        document.getElementById('settingsModal').classList.add('active');
    }
    
    hideSettings() {
        document.getElementById('settingsModal').classList.remove('active');
    }
    
    changeBackground(bg) {
        const overlay = document.querySelector('.background-overlay');
        overlay.className = `background-overlay ${bg}`;
    }
    
    updateBackgroundButtons(activeBtn) {
        document.querySelectorAll('.bg-option').forEach(option => {
            option.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
    

    
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text) {
            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.todos.push(todo);
            input.value = '';
            this.renderTodos();
            this.saveData();
        }
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.renderTodos();
            this.saveData();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.renderTodos();
        this.saveData();
    }
    
    renderTodos() {
        const todoList = document.getElementById('todoList');
        const completedCount = this.todos.filter(t => t.completed).length;
        
        // Update stats
        document.getElementById('todoStats').textContent = 
            `${completedCount} of ${this.todos.length} completed`;
        
        // Clear and render todos
        todoList.innerHTML = '';
        
        this.todos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            todoItem.innerHTML = `
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="app.toggleTodo(${todo.id})"></div>
                <div class="todo-text">${todo.text}</div>
                <button class="todo-delete" onclick="app.deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            todoList.appendChild(todoItem);
        });
    }
    
    updateStats() {
        // Check if it's a new day
        const today = new Date().toDateString();
        if (this.stats.lastDate !== today) {
            this.stats.todayTime = 0;
            this.stats.lastDate = today;
        }
        
        document.getElementById('totalSessions').textContent = this.stats.totalSessions;
        document.getElementById('totalTime').textContent = this.formatTime(this.stats.totalTime);
        document.getElementById('todayTime').textContent = this.formatTime(this.stats.todayTime);
    }
    
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
    
    showNotification(message) {
        const notification = document.getElementById('notification');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#667eea');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#764ba2');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
});
