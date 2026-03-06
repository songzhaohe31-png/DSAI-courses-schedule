/**
 * bridge.js v2
 * 1. 修复首页空白：自动渲染 Home 内容
 * 2. 修复 showPage 依赖 event.target 的问题
 * 3. 在课程弹窗注入「查看完整详情」按钮，链接到 course-detail.html
 * 4. 通过 localStorage 同步两页的课程状态
 */
(function () {
  const DETAIL_PAGE = 'course-detail.html';

  document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(function () {
      const mainContent = document.getElementById('mainContent');

      // 1. 修复首页空白
      if (mainContent && mainContent.innerHTML.trim() === '') {
        if (typeof window.renderHomePage === 'function') {
          mainContent.innerHTML = window.renderHomePage();
        }
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // 高亮 Home 导航按钮
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(l => { l.classList.remove('text-hkmu-blue', 'font-semibold'); l.classList.add('text-text-secondary'); });
      if (navLinks[0]) { navLinks[0].classList.remove('text-text-secondary'); navLinks[0].classList.add('text-hkmu-blue', 'font-semibold'); }

      // 2. 修复 showPage 不依赖 event.target
      const _original = window.showPage;
      if (typeof _original === 'function') {
        window.showPage = function (pageName) {
          const mainContent = document.getElementById('mainContent');
          if (!mainContent) return;

          document.querySelectorAll('.nav-link').forEach(l => { l.classList.remove('text-hkmu-blue', 'font-semibold'); l.classList.add('text-text-secondary'); });
          document.querySelectorAll('.nav-link').forEach(btn => {
            if ((btn.getAttribute('onclick') || '').includes("'" + pageName + "'")) {
              btn.classList.remove('text-text-secondary'); btn.classList.add('text-hkmu-blue', 'font-semibold');
            }
          });

          const mobileMenu = document.getElementById('mobileMenu');
          if (mobileMenu) mobileMenu.classList.add('hidden');

          const renders = { home: window.renderHomePage, progress: window.renderProgressPage, courses: window.renderCoursesPage, plan: window.renderPlanPage };
          const fn = renders[pageName];
          if (typeof fn === 'function') mainContent.innerHTML = fn();
          if (typeof lucide !== 'undefined') lucide.createIcons();
        };
      }

      // 3. 拦截 openCourseModal，注入「查看完整详情」按钮
      const _originalModal = window.openCourseModal;
      if (typeof _originalModal === 'function') {
        window.openCourseModal = function (courseId) {
          _originalModal.call(this, courseId);
          requestAnimationFrame(function () {
            if (document.getElementById('bridge-detail-btn')) return;
            const btn = document.createElement('a');
            btn.id = 'bridge-detail-btn';
            btn.href = DETAIL_PAGE + '?id=' + encodeURIComponent(courseId);
            btn.style.cssText = 'display:inline-flex;align-items:center;gap:10px;margin-top:24px;padding:50px 100px;background:#0066CC;color:white;border-radius:20px;font-size:25px;font-weight:700;text-decoration:none;transition:background 0.2s;width:100%;justify-content:center';
            btn.onmouseover = () => btn.style.background = '#0052a3';
            btn.onmouseout = () => btn.style.background = '#0066CC';
            btn.innerHTML = '📄 查看完整课程详情页';
            const modalContent = document.getElementById('courseModalContent');
            if (modalContent) modalContent.insertBefore(btn, modalContent.firstChild);
          });
        };
      }
    });
  });

  // 4. 页面重新可见时同步 localStorage 课程状态
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      const saved = JSON.parse(localStorage.getItem('courseStatuses') || '{}');
      if (window.userProgress) Object.assign(window.userProgress, saved);
    }
  });
})();
