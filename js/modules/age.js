function calculateAge(birthDate){
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

window.calculateAge = calculateAge;

const birthday = new Date(2009, 7, 22);

window.initAge = function() {
  const ageEl = document.getElementById("age");
  if (!ageEl) return;
  ageEl.textContent = ` ${calculateAge(birthday)} tuổi`;
};
