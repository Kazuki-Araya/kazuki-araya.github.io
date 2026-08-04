window.initProfileWidgets = function() {
  if (typeof window.initDiscordPresence === 'function') {
    window.initDiscordPresence();
  }
  initGitHubStats();
  initSectionReveal();
};

function initGitHubStats() {
  const githubRepos = document.getElementById("github-repos");
  const githubFollowers = document.getElementById("github-followers");
  const githubCreated = document.getElementById("github-created");
  const username = "kazuki-araya";
  const apiUrl = `https://api.github.com/users/${username}`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error("GitHub user not found");
      return response.json();
    })
    .then((data) => {
      if (githubRepos) githubRepos.textContent = data.public_repos || "0";
      if (githubFollowers) githubFollowers.textContent = data.followers || "0";
      if (githubCreated) githubCreated.textContent = data.created_at ? formatGitHubDate(data.created_at) : "--";
    })
    .catch(() => {
      if (githubRepos) githubRepos.textContent = "--";
      if (githubFollowers) githubFollowers.textContent = "--";
      if (githubCreated) githubCreated.textContent = "--";
    });
}

function formatGitHubDate(value) {
  const date = new Date(value);
  return `${date.getFullYear()}`;
}

function initSectionReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((section) => section.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -120px 0px",
      threshold: 0.2
    }
  );

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
}