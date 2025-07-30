// SmartScreen Help Modal logic
document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('smartscreenHelpBtn');
    var modal = document.getElementById('smartscreenModal');
    var closeBtn = document.getElementById('closeSmartscreenModal');
    if (btn && modal && closeBtn) {
        btn.onclick = function() {
            modal.style.display = 'flex';
        };
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});
