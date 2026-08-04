/**
 * Visitor Counter Module
 * Đếm số lượng visitor sử dụng localStorage + API dự phòng
 */

window.initVisitor = function() {
  const STORAGE_KEY = "kazuki_visitors";
  const VISITED_KEY = "kazuki_visited";
  
  // Danh sách API counter dự phòng
  const COUNTER_APIS = [
    "https://api.counterapi.dev/v1/kazukiaraya/visits/up",
    "https://api.countapi.xyz/hit/kazuki-araya/visits",
    "https://countapi.xyz/hit/kazuki-araya/visits",
    "https://api.visitorcount.xyz/hit/kazuki-araya"
  ];

  /**
   * Lấy counter từ localStorage, khởi tạo = 1 nếu chưa có
   */
  function getLocalCount() {
    let count = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
    return count;
  }

  /**
   * Lưu counter vào localStorage
   */
  function setLocalCount(count) {
    localStorage.setItem(STORAGE_KEY, count.toString());
  }

  /**
   * Tăng counter local nếu chưa visit trong phiên này
   */
  function incrementLocalIfNeeded() {
    if (sessionStorage.getItem(VISITED_KEY)) return false;
    sessionStorage.setItem(VISITED_KEY, "1");
    const newCount = getLocalCount() + 1;
    setLocalCount(newCount);
    return true;
  }

  /**
   * Cập nhật hiển thị counter với animation đếm lên
   */
  function updateVisitorDisplay(count) {
    const visitorElement = document.getElementById("visitor-count");
    if (!visitorElement) return;

    const targetCount = count;
    let currentCount = 0;
    const steps = Math.min(30, targetCount);
    const increment = Math.max(1, Math.ceil(targetCount / steps));
    
    const timer = setInterval(() => {
      currentCount += increment;
      if (currentCount >= targetCount) {
        currentCount = targetCount;
        clearInterval(timer);
      }
      visitorElement.textContent = currentCount.toLocaleString();
    }, 20);
  }

  /**
   * Hàm chính: lấy count từ API, fallback về localStorage
   */
  async function fetchAndDisplayCount() {
    // Tăng local counter nếu cần
    const isNewVisit = incrementLocalIfNeeded();
    let localCount = getLocalCount();
    
    // Hiển thị local count ngay lập tức
    updateVisitorDisplay(localCount);

    // Thử gọi API counter
    for (const apiUrl of COUNTER_APIS) {
      try {
        const response = await fetch(apiUrl, { 
          signal: AbortSignal.timeout(3000) 
        });
        if (!response.ok) continue;
        const data = await response.json();
        if (data && data.value) {
          // API thành công - cập nhật với giá trị từ server
          setLocalCount(data.value);
          updateVisitorDisplay(data.value);
          return;
        }
      } catch (e) {
        // API lỗi, thử API tiếp theo
        continue;
      }
    }
    
    // Tất cả API đều lỗi, vẫn dùng localStorage
    console.log("📊 Visitor counter: dùng localStorage (API không khả dụng)");
  }

  // Khởi tạo
  fetchAndDisplayCount();
};