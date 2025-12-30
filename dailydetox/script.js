// Firebase Config
        const firebaseConfig = {
            apiKey: "AIzaSyByxgR9zgzwSPhFSxiDCqGh7Tc4EAsi3nk",
            authDomain: "urbansync-1c08f.firebaseapp.com",
            projectId: "urbansync-1c08f",
            storageBucket: "urbansync-1c08f.firebasestorage.app",
            messagingSenderId: "614392709456",
            appId: "1:614392709456:web:1b4a229d9bd73f6ccaec55",
            measurementId: "G-V8NBYGJW2L"
        };

        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.database();

        let currentUser = null;
        let appData = {
            spending: [],
            wardrobe: [],
            recipes: 0,
            workouts: 0
        };

        // Auth UI
        const authScreen = document.getElementById('authScreen');
        const appScreen = document.getElementById('appScreen');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const authError = document.getElementById('authError');

        document.getElementById('showSignupBtn').onclick = (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            authError.textContent = '';
        };

        document.getElementById('showLoginBtn').onclick = (e) => {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            authError.textContent = '';
        };

        document.getElementById('loginBtn').onclick = async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                authError.textContent = 'Please enter email and password';
                return;
            }
            
            try {
                authError.textContent = '';
                await auth.signInWithEmailAndPassword(email, password);
            } catch (err) {
                if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                    authError.textContent = 'Invalid email or password';
                } else if (err.code === 'auth/invalid-email') {
                    authError.textContent = 'Invalid email format';
                } else {
                    authError.textContent = 'Login failed. Please try again.';
                }
            }
        };

        document.getElementById('signupBtn').onclick = async (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            
            if (!email || !password) {
                authError.textContent = 'Please enter email and password';
                return;
            }
            
            if (password.length < 6) {
                authError.textContent = 'Password must be at least 6 characters';
                return;
            }
            
            try {
                authError.textContent = '';
                await auth.createUserWithEmailAndPassword(email, password);
            } catch (err) {
                if (err.code === 'auth/email-already-in-use') {
                    authError.textContent = 'Email already in use';
                } else if (err.code === 'auth/invalid-email') {
                    authError.textContent = 'Invalid email format';
                } else if (err.code === 'auth/weak-password') {
                    authError.textContent = 'Password is too weak';
                } else {
                    authError.textContent = 'Signup failed. Please try again.';
                }
            }
        };

        document.getElementById('logoutBtn').onclick = () => auth.signOut();

        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                authScreen.style.display = 'none';
                appScreen.style.display = 'block';
                loadUserData();
            } else {
                currentUser = null;
                appScreen.style.display = 'none';
                authScreen.style.display = 'flex';
            }
        });

        // Load User Data
        function loadUserData() {
            if (!currentUser) return;
            
            db.ref('users/' + currentUser.uid).once('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    appData = data;
                    updateStats();
                    renderSpending();
                    renderWardrobe();
                }
            });
        }

        function saveData() {
            if (!currentUser) return;
            db.ref('users/' + currentUser.uid).set(appData);
            updateStats();
        }

        function updateStats() {
            const totalSaved = appData.spending
                .filter(s => s.category === 'food' || s.category === 'shopping')
                .reduce((sum, s) => sum + s.amount * 0.6, 0);
            
            document.getElementById('totalSaved').textContent = '₹' + Math.round(totalSaved);
            document.getElementById('recipesCount').textContent = appData.recipes;
            document.getElementById('workoutsCount').textContent = appData.workouts;
        }

        // Tab Navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
            };
        });

        // Commute Section
        let selectedCommute = null;
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedCommute = btn.dataset.type;
            };
        });

        document.getElementById('stressLevel').oninput = (e) => {
            document.getElementById('stressValue').textContent = e.target.value;
        };

        document.getElementById('getExerciseBtn').onclick = () => {
            const time = parseInt(document.getElementById('commuteTime').value) || 0;
            const stress = document.getElementById('stressLevel').value;

            if (!selectedCommute || time < 5) {
                alert('Please select commute type and enter time!');
                return;
            }

            const exercises = {
                train: {
                    name: '🚆 Standing Core Workout',
                    desc: '1. Calf raises: 20 reps every 5 mins\n2. Core tightening: Hold 15 secs, release. Repeat 10x\n3. Isometric glute squeeze: 10 secs hold, 15x\n\nNo one will notice - perfect for crowded trains!',
                    calories: '~30 cal',
                    duration: `${time} mins`
                },
                bus: {
                    name: '🧘 Box Breathing Session',
                    desc: '1. Inhale for 4 counts\n2. Hold for 4 counts\n3. Exhale for 4 counts\n4. Hold for 4 counts\n\nRepeat 10 cycles. Reduces stress by 25% in 10 minutes.',
                    calories: 'Stress relief',
                    duration: '10 mins'
                },
                car: {
                    name: '🚗 Neck & Shoulder Relief',
                    desc: '1. Neck rolls: 10 each direction\n2. Shoulder shrugs: Hold 2 secs, 20 reps\n3. Grip tension release: Squeeze 3 secs, 15x\n\nPrevents stiffness from long drives.',
                    calories: 'Tension relief',
                    duration: '8 mins'
                },
                walk: {
                    name: '🚶 Mindful Walking',
                    desc: '1. Focus on breath rhythm\n2. Notice 5 things you see\n3. Walk with good posture\n4. Deep breaths every 2 mins\n\nTurn walking into meditation.',
                    calories: `~${time * 4} cal`,
                    duration: `${time} mins`
                }
            };

            const exercise = exercises[selectedCommute];
            let html = `
                <div class="card">
                    <div class="exercise-card">
                        <div class="exercise-name">${exercise.name}</div>
                        <div class="exercise-desc">${exercise.desc}</div>
                        <div class="exercise-meta">
                            <span>⏱️ ${exercise.duration}</span>
                            <span>🔥 ${exercise.calories}</span>
                        </div>
                    </div>
                </div>
            `;

            if (stress >= 7) {
                html += `
                    <div class="alert alert-warning">
                        ⚠️ <strong>High stress detected!</strong> Consider a light dinner tonight (curd rice) and 10 mins meditation before bed.
                    </div>
                `;
            }

            document.getElementById('exerciseResult').innerHTML = html;
            appData.workouts++;
            saveData();
        };

        // Kitchen Section
        const recipes = {
            stressed: {
                name: '🍚 Curd Rice with Tadka',
                time: '5 mins',
                cost: '₹20',
                mood: 'For stressed, tired minds',
                desc: 'Cools the gut, easy to digest, rich in probiotics. Instant comfort food.',
                ingredients: 'Cooked rice • Curd • Green chili • Curry leaves • Mustard seeds • Salt'
            },
            energetic: {
                name: '🥗 Sattu Chickpea Chaat',
                time: '10 mins',
                cost: '₹30',
                mood: 'For energetic vibes',
                desc: 'Protein-packed, quick, tasty. Perfect after a good day.',
                ingredients: 'Sattu • Boiled chickpeas • Tomato • Onion • Lemon • Chaat masala'
            },
            tired: {
                name: '🍲 Moong Dal Khichdi',
                time: '15 mins',
                cost: '₹25',
                mood: 'Balanced & healing',
                desc: 'Complete protein, nutritious. The comfort meal that always works.',
                ingredients: 'Moong dal • Rice • Spinach • Ginger-garlic • Turmeric • Ghee'
            }
        };

        document.getElementById('getRecipeBtn').onclick = () => {
            const mood = document.getElementById('moodInput').value.toLowerCase();
            let recipe;

            if (mood.includes('stress') || mood.includes('tired') || mood.includes('exhaust')) {
                recipe = recipes.stressed;
            } else if (mood.includes('good') || mood.includes('energetic') || mood.includes('great')) {
                recipe = recipes.energetic;
            } else {
                recipe = recipes.tired;
            }

            const html = `
                <div class="card">
                    <div class="recipe-card">
                        <div class="recipe-name">${recipe.name}</div>
                        <div style="font-size: 12px; color: #78350f; margin-bottom: 8px; font-style: italic;">"${recipe.mood}"</div>
                        <div class="recipe-meta">
                            <span>⏱️ ${recipe.time}</span>
                            <span>${recipe.cost}</span>
                        </div>
                        <div class="recipe-ingredients" style="margin-bottom: 12px;">
                            <strong>Ingredients:</strong><br>
                            ${recipe.ingredients}
                        </div>
                        <p style="font-size: 13px; color: #92400e; line-height: 1.6;">${recipe.desc}</p>
                    </div>
                    <button class="btn btn-primary" id="cookedRecipeBtn" style="margin-top: 12px;">✅ I Cooked This!</button>
                </div>
            `;

            document.getElementById('recipeResult').innerHTML = html;
            
            document.getElementById('cookedRecipeBtn').onclick = () => {
                appData.recipes++;
                saveData();
                alert('🎉 Great! Added to your cooking streak!');
            };
        };

        // Spending Section
        document.getElementById('addSpendBtn').onclick = () => {
            const desc = document.getElementById('spendDesc').value.trim();
            const amount = parseFloat(document.getElementById('spendAmount').value);
            const category = document.getElementById('spendCategory').value;

            if (!desc || !amount || !category) {
                alert('Please fill all fields!');
                return;
            }

            const spending = {
                id: Date.now(),
                desc,
                amount,
                category,
                date: new Date().toLocaleDateString()
            };

            appData.spending.push(spending);
            saveData();

            // Show reality check for food/shopping
            if (category === 'food' || category === 'shopping') {
                const thalis = Math.ceil(amount / 50);
                const html = `
                    <div class="alert alert-warning">
                        ⚠️ <strong>Reality Check:</strong> ₹${amount} = <strong>${thalis} home-cooked thalis</strong><br>
                        You could save <strong>₹${Math.round(amount * 0.6)}</strong> by cooking at home!
                    </div>
                `;
                document.getElementById('spendAlert').innerHTML = html;
            } else {
                document.getElementById('spendAlert').innerHTML = '';
            }

            // Clear form
            document.getElementById('spendDesc').value = '';
            document.getElementById('spendAmount').value = '';
            document.getElementById('spendCategory').value = '';

            renderSpending();
        };

        function renderSpending() {
            const recent = appData.spending.slice(-10).reverse();
            const icons = {
                food: '🍕',
                fashion: '👗',
                shopping: '🛍️',
                health: '💪'
            };

            if (recent.length === 0) {
                document.getElementById('spendingList').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">💰</div>
                        <p>No spending logged yet</p>
                    </div>
                `;
                return;
            }

            const html = recent.map(s => `
                <div class="spending-item ${s.category === 'health' ? 'saved' : ''}">
                    <div class="spending-info">
                        <div class="spending-name">${icons[s.category] || '💳'} ${s.desc}</div>
                        <div class="spending-date">${s.date}</div>
                    </div>
                    <div class="spending-amount">₹${s.amount}</div>
                </div>
            `).join('');

            document.getElementById('spendingList').innerHTML = html;
        }

        // Wardrobe Section
        document.getElementById('addWardrobeBtn').onclick = () => {
            const type = document.getElementById('wardrobeType').value;
            const color = document.getElementById('wardrobeColor').value.trim();

            if (!type || !color) {
                alert('Please fill all fields!');
                return;
            }

            const item = {
                id: Date.now(),
                type,
                color
            };

            appData.wardrobe.push(item);
            saveData();

            document.getElementById('wardrobeType').value = '';
            document.getElementById('wardrobeColor').value = '';

            renderWardrobe();
        };

        function renderWardrobe() {
            const icons = {
                shirt: '👔',
                kurta: '👗',
                jeans: '👖',
                dress: '👚'
            };

            if (appData.wardrobe.length === 0) {
                document.getElementById('wardrobeList').innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <div class="empty-state-icon">👕</div>
                        <p>Your closet is empty</p>
                    </div>
                `;
                return;
            }

            const html = appData.wardrobe.map(item => `
                <div class="wardrobe-item">
                    <div class="wardrobe-icon">${icons[item.type] || '👕'}</div>
                    <div class="wardrobe-name">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
                    <div class="wardrobe-color">${item.color}</div>
                </div>
            `).join('');

            document.getElementById('wardrobeList').innerHTML = html;
        }

        document.getElementById('checkDuplicateBtn').onclick = () => {
            const newItem = document.getElementById('newItemCheck').value.toLowerCase().trim();

            if (!newItem) {
                alert('Please enter what you want to buy!');
                return;
            }

            const duplicates = appData.wardrobe.filter(item => {
                const itemType = item.type.toLowerCase();
                const itemColor = item.color.toLowerCase();
                return newItem.includes(itemType) || newItem.includes(itemColor);
            });

            let html = '';

            if (duplicates.length > 0) {
                const list = duplicates.map(d => `<strong>${d.type}</strong> in ${d.color}`).join(', ');
                html = `
                    <div class="alert alert-warning">
                        🚨 <strong>You already own this!</strong><br>
                        Found ${duplicates.length} similar item(s): ${list}<br><br>
                        💡 <strong>Smart Decision:</strong> DON't BUY. Try the "One-In, One-Out" rule instead.
                    </div>
                `;
            } else {
                html = `
                    <div class="alert alert-success">
                        ✅ <strong>Good match!</strong><br>
                        You don't have this item. But ask yourself:<br>
                        • Do I have 3+ similar items?<br>
                        • Can I mix it with 5+ existing pieces?
                    </div>
                `;
            }

            document.getElementById('wardrobeAlert').innerHTML = html;
        };

        // Initialize
        renderSpending();
        renderWardrobe();