const STORAGE_KEY = "chocosocial-session-v1";

/** @typedef {{ id: string, name: string, avatarUrl: string }} User */
/** @typedef {{ id: string, name: string, price: number, imageUrl: string, description: string }} Product */
/** @typedef {{ id: string, authorId: string, productId: string|null, text: string, imageUrl: string|null, createdAt: string, deletedAt?: string|null }} Post */
/** @typedef {{ id: string, postId: string, authorId: string, text: string, createdAt: string, deletedAt?: string|null }} Comment */
/** @typedef {{ postId: string, userId: string }} Like */

let seed = null;
/** @type {{ posts: Post[], comments: Comment[], likes: Like[], reports: { id: string, entityType: string, entityId: string, reason: string, createdAt: string }[] }} */
let session = { posts: [], comments: [], likes: [], reports: [] };

const $app = document.getElementById("app");
const $modalRoot = document.getElementById("modal-root");
const $userSelect = document.getElementById("current-user");

function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) session = { ...session, ...JSON.parse(raw) };
  } catch {
    session = { posts: [], comments: [], likes: [], reports: [] };
  }
}

function saveSession() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getCurrentUserId() {
  return $userSelect.value;
}

function userById(id) {
  return seed.users.find((u) => u.id === id);
}

function productById(id) {
  return seed.products.find((p) => p.id === id);
}

function allPosts() {
  const merged = [...seed.posts, ...session.posts].filter((p) => !p.deletedAt);
  return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function postById(id) {
  return allPosts().find((p) => p.id === id);
}

function commentsForPost(postId) {
  const merged = [...seed.comments, ...session.comments].filter(
    (c) => c.postId === postId && !c.deletedAt
  );
  return merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function isLiked(postId, userId) {
  if (session.likes.some((l) => l.postId === postId && l.userId === userId && l._removed)) {
    return false;
  }
  if (session.likes.some((l) => l.postId === postId && l.userId === userId && !l._removed)) {
    return true;
  }
  return seed.likes.some((l) => l.postId === postId && l.userId === userId);
}

function likeCount(postId) {
  let count = 0;
  for (const u of seed.users) {
    if (isLiked(postId, u.id)) count++;
  }
  return count;
}

function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderProductChip(productId) {
  const product = productById(productId);
  if (!product) return "";
  return `<button type="button" class="product-chip" data-route="product/${product.id}">
    <img src="${escapeHtml(product.imageUrl)}" alt="" width="28" height="28" />
    ${escapeHtml(product.name)}
  </button>`;
}

function renderPostCard(post, { link = true } = {}) {
  const author = userById(post.authorId);
  const productHtml = post.productId ? renderProductChip(post.productId) : "";
  const imageHtml = post.imageUrl
    ? `<img class="post-image" src="${escapeHtml(post.imageUrl)}" alt="" />`
    : "";
  const tag = link ? "article" : "div";
  const attrs = link
    ? `class="post-card" data-route="post/${post.id}" tabindex="0" role="button"`
    : `class="post-card"`;

  return `<${tag} ${attrs}>
    <header>
      <img class="avatar" src="${escapeHtml(author?.avatarUrl || "")}" alt="" />
      <div class="meta">
        <strong>${escapeHtml(author?.name || "Unknown")}</strong>
        <time datetime="${post.createdAt}">${formatTime(post.createdAt)}</time>
      </div>
    </header>
    <p class="post-text">${escapeHtml(post.text)}</p>
    ${imageHtml}
    ${productHtml}
    <div class="stats">
      <span>${likeCount(post.id)} likes</span>
      <span>${commentsForPost(post.id).length} comments</span>
    </div>
  </${tag}>`;
}

function renderFeed() {
  const posts = allPosts();
  const cards = posts.length
    ? posts.map((p) => renderPostCard(p)).join("")
    : '<p class="empty">No posts yet. Create the first one!</p>';

  $app.innerHTML = `
    <h1>Community feed</h1>
    <p style="color: var(--muted); margin-top: 0;">Newest posts from chocolate lovers (stub + session data).</p>
    ${cards}
  `;
}

function renderPostDetail(postId) {
  const post = postById(postId);
  if (!post) {
    $app.innerHTML = `<p class="empty">Post not found.</p>`;
    return;
  }

  const userId = getCurrentUserId();
  const liked = isLiked(postId, userId);
  const comments = commentsForPost(postId)
    .map((c) => {
      const author = userById(c.authorId);
      const canDelete = c.authorId === userId;
      return `<div class="comment" data-comment-id="${c.id}">
        <header>
          <img class="avatar" src="${escapeHtml(author?.avatarUrl || "")}" alt="" />
          <div class="meta">
            <strong>${escapeHtml(author?.name || "Unknown")}</strong>
            <time datetime="${c.createdAt}">${formatTime(c.createdAt)}</time>
          </div>
          ${canDelete ? `<button type="button" class="btn-secondary btn-delete-comment" data-id="${c.id}">Delete</button>` : ""}
        </header>
        <p>${escapeHtml(c.text)}</p>
      </div>`;
    })
    .join("");

  const canDeletePost = post.authorId === userId;

  $app.innerHTML = `
    <button type="button" class="back-link" data-route="feed">← Back to feed</button>
    ${renderPostCard(post, { link: false })}
    <div class="detail-actions">
      <button type="button" class="btn" id="toggle-like">${liked ? "Unlike" : "Like"} (${likeCount(postId)})</button>
      ${canDeletePost ? `<button type="button" class="btn btn-danger" id="delete-post">Delete post</button>` : ""}
      <button type="button" class="btn-secondary" id="report-post">Report (stub)</button>
    </div>
    <section class="comments">
      <h2>Comments</h2>
      ${comments || '<p class="empty">No comments yet.</p>'}
      <form class="comment-form" id="comment-form">
        <label for="comment-text">Add a comment</label>
        <textarea id="comment-text" rows="3" maxlength="500" required placeholder="Write a comment…"></textarea>
        <button type="submit" class="btn">Post comment</button>
      </form>
    </section>
  `;

  document.getElementById("toggle-like")?.addEventListener("click", () => {
    toggleLike(postId, userId);
    renderPostDetail(postId);
  });

  document.getElementById("delete-post")?.addEventListener("click", () => {
    deletePost(postId);
    navigate("feed");
  });

  document.getElementById("report-post")?.addEventListener("click", () => {
    session.reports.push({
      id: uid("report"),
      entityType: "post",
      entityId: postId,
      reason: "Demo report",
      createdAt: new Date().toISOString(),
    });
    saveSession();
    alert("Report recorded (stub only, not sent anywhere).");
  });

  document.getElementById("comment-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.getElementById("comment-text").value.trim();
    if (!text) return;
    session.comments.push({
      id: uid("c"),
      postId,
      authorId: userId,
      text,
      createdAt: new Date().toISOString(),
    });
    saveSession();
    renderPostDetail(postId);
  });

  $app.querySelectorAll(".btn-delete-comment").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteComment(btn.dataset.id);
      renderPostDetail(postId);
    });
  });
}

function renderProduct(productId) {
  const product = productById(productId);
  if (!product) {
    $app.innerHTML = `<p class="empty">Product not found.</p>`;
    return;
  }

  $app.innerHTML = `
    <button type="button" class="back-link" data-route="feed">← Back to feed</button>
    <article class="product-detail">
      <h1>${escapeHtml(product.name)}</h1>
      <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" />
      <p class="price">$${product.price.toFixed(2)}</p>
      <p>${escapeHtml(product.description)}</p>
    </article>
  `;
}

function toggleLike(postId, userId) {
  const inSeed = seed.likes.some((l) => l.postId === postId && l.userId === userId);
  const sessionIdx = session.likes.findIndex(
    (l) => l.postId === postId && l.userId === userId
  );

  if (isLiked(postId, userId)) {
    if (inSeed && sessionIdx === -1) {
      session.likes.push({ postId, userId, _removed: true });
    } else if (sessionIdx >= 0) {
      session.likes.splice(sessionIdx, 1);
    } else {
      session.likes.push({ postId, userId, _removed: true });
    }
  } else if (sessionIdx >= 0) {
    session.likes.splice(sessionIdx, 1);
  } else {
    session.likes.push({ postId, userId });
  }
  saveSession();
}

function deletePost(postId) {
  const mark = (p) => {
    if (p.id === postId) p.deletedAt = new Date().toISOString();
  };
  seed.posts.forEach(mark);
  session.posts.forEach(mark);
  saveSession();
}

function deleteComment(commentId) {
  const mark = (c) => {
    if (c.id === commentId) c.deletedAt = new Date().toISOString();
  };
  seed.comments.forEach(mark);
  session.comments.forEach(mark);
  saveSession();
}

function openComposeModal() {
  const productOptions = seed.products
    .map(
      (p) =>
        `<option value="${p.id}">${escapeHtml(p.name)}</option>`
    )
    .join("");

  $modalRoot.classList.remove("hidden");
  $modalRoot.innerHTML = `
    <div class="modal-backdrop" id="close-modal">
      <div class="modal" role="dialog" aria-labelledby="compose-title">
        <h2 id="compose-title">New post</h2>
        <form class="compose-form" id="compose-form">
          <label for="post-text">Text (required, max 280)</label>
          <textarea id="post-text" rows="4" maxlength="280" required placeholder="Share your chocolate experience…"></textarea>
          <label for="post-product">Product (optional)</label>
          <select id="post-product">
            <option value="">— None —</option>
            ${productOptions}
          </select>
          <label for="post-image">Image URL (optional, local path only in demo)</label>
          <input type="text" id="post-image" placeholder="/images/post-caramel.svg" />
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button type="button" class="btn-secondary" id="cancel-compose">Cancel</button>
            <button type="submit" class="btn">Publish</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => {
    $modalRoot.classList.add("hidden");
    $modalRoot.innerHTML = "";
  };

  document.getElementById("close-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "close-modal") close();
  });
  document.getElementById("cancel-compose")?.addEventListener("click", close);

  document.getElementById("compose-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.getElementById("post-text").value.trim();
    const productId = document.getElementById("post-product").value || null;
    const imageUrl = document.getElementById("post-image").value.trim() || null;
    if (!text) return;

    session.posts.push({
      id: uid("post"),
      authorId: getCurrentUserId(),
      productId,
      text,
      imageUrl,
      createdAt: new Date().toISOString(),
    });
    saveSession();
    close();
    navigate("feed");
  });
}

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "") || "feed";
  const [view, id] = hash.split("/");
  return { view, id };
}

function navigate(path) {
  location.hash = `#/${path}`;
}

function render() {
  const { view, id } = parseRoute();
  if (view === "post" && id) renderPostDetail(id);
  else if (view === "product" && id) renderProduct(id);
  else renderFeed();
}

async function init() {
  loadSession();
  const res = await fetch("/data/stub.json");
  seed = await res.json();

  seed.users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = u.name;
    $userSelect.appendChild(opt);
  });
  $userSelect.value = seed.users[0].id;

  document.getElementById("nav-feed")?.addEventListener("click", () => navigate("feed"));
  document.getElementById("nav-compose")?.addEventListener("click", openComposeModal);

  $app.addEventListener("click", (e) => {
    const routeEl = e.target.closest("[data-route]");
    if (!routeEl?.dataset.route) return;
    e.preventDefault();
    e.stopPropagation();
    navigate(routeEl.dataset.route);
  });

  $app.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const card = e.target.closest("[data-route]");
      if (card?.dataset.route) navigate(card.dataset.route);
    }
  });

  window.addEventListener("hashchange", render);
  render();
}

init().catch((err) => {
  $app.innerHTML = `<p class="empty">Failed to load demo data. Run a local server from the public folder. (${escapeHtml(String(err))})</p>`;
});
