#!/bin/bash
cd ~/projects/babyhaus-catalog
export PATH="$HOME/.npm-global/bin:$PATH"

echo "=== CLAUDE REBUILD STARTED ===" > ~/claude-rebuild.log
echo "Started at: $(date)" >> ~/claude-rebuild.log
echo "" >> ~/claude-rebuild.log

hermes chat -q "$(cat CLAUDE_BRIEF.md)" -m anthropic/claude-opus-4 --provider openrouter 2>&1 | tee -a ~/claude-rebuild.log

echo "" >> ~/claude-rebuild.log
echo "=== CLAUDE REBUILD FINISHED ===" >> ~/claude-rebuild.log
echo "Finished at: $(date)" >> ~/claude-rebuild.log
