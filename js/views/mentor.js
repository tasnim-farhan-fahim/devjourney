import { escapeHTML } from '../utils/formatters.js';
import { Toast } from '../components/toast.js';

export function renderMentor(viewportEl, dataService) {
  const mentorText = dataService.generateMentorContext();

  viewportEl.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>AI Mentor Context Generator</h1>
        <p>Generate a compact summary of your progress, recent logs, and open blockers for AI mentor prompts.</p>
      </div>
      <button id="btn-copy-mentor-context" class="btn btn-primary">
        <i class="fa-solid fa-copy"></i> <span>Copy to Clipboard</span>
      </button>
    </div>

    <div class="card" style="margin-bottom: var(--space-lg);">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fa-solid fa-lightbulb" style="color: var(--status-warning); margin-right: 6px;"></i>How to use this with AI Mentors
        </h3>
      </div>
      <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
        Copy the generated context snippet below and paste it at the beginning of your prompt in ChatGPT, Claude, Gemini, or any AI assistant. 
        This gives the AI immediate, complete context on your current study hours, active projects, recent learning focus, and technical roadblocks.
      </p>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fa-solid fa-file-code" style="color: var(--accent-primary); margin-right: 6px;"></i>Formatted Context Output
        </h3>
        <span class="badge badge-neutral">Plain Text / Markdown</span>
      </div>

      <pre id="mentor-text-block" class="code-block">${escapeHTML(mentorText)}</pre>
    </div>
  `;

  // Copy to clipboard handler
  document.getElementById('btn-copy-mentor-context')?.addEventListener('click', () => {
    navigator.clipboard.writeText(mentorText).then(() => {
      Toast.success('Mentor context copied to clipboard!');
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
      // Fallback manual selection
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(document.getElementById('mentor-text-block'));
      selection.removeAllRanges();
      selection.addRange(range);
      Toast.info('Text selected! Press Ctrl+C to copy.');
    });
  });
}
