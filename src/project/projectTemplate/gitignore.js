const template = `\
lib-cov
*.seed
*.log
*.csv
*.dat
*.out
*.pid
*.gz
*.swp

pids
logs
results
tmp

# Coverage reports
coverage

# API keys and secrets
.env

# Dependency directory
node_modules
bower_components

# Editors
.idea
*.iml

# OS metadata
.DS_Store
Thumbs.db

# Ignore built files
dist/**/*
build/**/*

# ignore yarn.lock
yarn.lock

# Ignore Virtstand files
.virtstand/**/*
`;

export default template;
