const navbar = document.querySelector('.navbar');
const navbarNav = document.querySelector('.navbar-nav');
const hamburgerMenu = document.querySelector('#humburger-menu');

if (navbar && navbarNav && hamburgerMenu) {
	const updateNavbarPosition = () => {
		navbar.classList.toggle('scrolled', window.scrollY > 0);
	};

	updateNavbarPosition();
	window.addEventListener('scroll', updateNavbarPosition, { passive: true });

	const closeMenu = () => {
		navbar.classList.remove('menu-active');
		navbarNav.classList.remove('active');
		hamburgerMenu.setAttribute('aria-expanded', 'false');
		hamburgerMenu.setAttribute('aria-label', 'Buka menu');
		document.body.classList.remove('menu-open');
	};

	hamburgerMenu.addEventListener('click', (event) => {
		event.preventDefault();
		const isOpen = navbarNav.classList.toggle('active');

		navbar.classList.toggle('menu-active', isOpen);
		hamburgerMenu.setAttribute('aria-expanded', String(isOpen));
		hamburgerMenu.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
		document.body.classList.toggle('menu-open', isOpen);
	});

	navbarNav.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', closeMenu);
	});

	document.addEventListener('click', (event) => {
		if (!navbarNav.contains(event.target) && !hamburgerMenu.contains(event.target)) {
			closeMenu();
		}
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			closeMenu();
		}
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth > 768) {
			closeMenu();
		}
	});
}

const heroPanels = document.querySelectorAll('.hero-mode__panel');
const menuModes = document.querySelectorAll('.menu-mode');
const aboutModes = document.querySelectorAll('.about-mode');
const modeToggle = document.querySelector('#mode-toggle');
const modeToggleLabel = document.querySelector('.mode-switch__label');

const syncModeDisplay = (theme) => {
	document.body.dataset.theme = theme;

	heroPanels.forEach((item) => {
		const isActive = item.dataset.mode === theme;
		item.classList.toggle('is-active', isActive);
		item.setAttribute('aria-pressed', String(isActive));
	});

	menuModes.forEach((menu) => {
		menu.classList.toggle('is-visible', menu.dataset.menu === theme);
	});

	aboutModes.forEach((section) => {
		section.classList.toggle('is-visible', section.dataset.about === theme);
	});

	if (modeToggle) {
		const isNight = theme === 'night';
		modeToggle.dataset.mode = theme;
		modeToggle.classList.toggle('is-night', isNight);
		modeToggle.setAttribute('aria-pressed', String(isNight));
		modeToggle.setAttribute('aria-label', isNight ? 'Ganti ke mode Food' : 'Ganti ke mode Bucket');
		if (modeToggleLabel) {
			modeToggleLabel.textContent = isNight ? 'Bucket' : 'Food';
		}
		const icon = modeToggle.querySelector('.mode-switch__icon');
		if (icon) {
			icon.textContent = isNight ? '🌸' : '🍽️';
		}
	}
};

if (modeToggle) {
	modeToggle.addEventListener('click', () => {
		const nextTheme = document.body.dataset.theme === 'night' ? 'day' : 'night';
		syncModeDisplay(nextTheme);
	});
}

if (heroPanels.length) {
	heroPanels.forEach((panel) => {
		panel.addEventListener('click', () => {
			const nextTheme = panel.dataset.mode === 'night' ? 'night' : 'day';
			syncModeDisplay(nextTheme);
		});
	});
}

if (document.body.dataset.theme) {
	syncModeDisplay(document.body.dataset.theme);
}

const bagShell = document.querySelector('#bag-shell');
const bagDrawer = document.querySelector('#bag-drawer');
const bagTrigger = document.querySelector('#shopping-bag');
const bagItems = document.querySelector('.bag-items');
const bagCount = document.querySelector('[data-bag-count]');
const bagTotal = document.querySelector('[data-bag-total]');
const bagOrderLink = document.querySelector('[data-order-link]');
const productDetailShell = document.querySelector('#product-detail-shell');
const productDetailDialog = document.querySelector('#product-detail-dialog');
const productDetailImage = document.querySelector('[data-detail-image]');
const productDetailName = document.querySelector('[data-detail-name]');
const productDetailCategory = document.querySelector('[data-detail-category]');
const productDetailAdd = document.querySelector('[data-detail-add]');
const bag = new Map();
let bagReturnFocus = null;
let productDetailReturnFocus = null;
let selectedProduct = null;

const renderBag = () => {
	if (!bagItems || !bagCount || !bagTotal) return;

	bagItems.replaceChildren();
	const itemCount = [...bag.values()].reduce((total, item) => total + item.quantity, 0);
	bagCount.textContent = String(itemCount);
	bagCount.hidden = itemCount === 0;
	bagTotal.textContent = `(${itemCount})`;
	if (bagOrderLink) {
		if (itemCount === 0) {
			bagOrderLink.removeAttribute('href');
			bagOrderLink.setAttribute('aria-disabled', 'true');
			bagOrderLink.setAttribute('tabindex', '-1');
			bagOrderLink.classList.add('is-disabled');
		} else {
			const orderMessage = `halo kak asalammualaikum aku mau pesan:\n${[...bag.values()]
				.map((item) => `- ${item.name} x${item.quantity}`)
				.join('\n')}`;
			const orderUrl = new URL('https://wa.me/6285817775978');
			orderUrl.searchParams.set('text', orderMessage);
			bagOrderLink.href = orderUrl.toString();
			bagOrderLink.setAttribute('aria-disabled', 'false');
			bagOrderLink.removeAttribute('tabindex');
			bagOrderLink.classList.remove('is-disabled');
		}
	}

	if (bag.size === 0) {
		const emptyMessage = document.createElement('p');
		emptyMessage.className = 'bag-empty';
		emptyMessage.textContent = 'Tas belanja masih kosong.';
		bagItems.append(emptyMessage);
		return;
	}

	bag.forEach((item, key) => {
		const row = document.createElement('article');
		row.className = 'bag-item';

		const image = document.createElement('img');
		image.src = item.image;
		image.alt = '';

		const details = document.createElement('div');
		details.className = 'bag-item__details';
		const name = document.createElement('h3');
		name.textContent = item.name;
		const quantity = document.createElement('span');
		quantity.textContent = `Jumlah: ${item.quantity}`;
		details.append(name, quantity);

		const remove = document.createElement('button');
		remove.type = 'button';
		remove.className = 'bag-remove';
		remove.dataset.removeItem = key;
		remove.setAttribute('aria-label', `Hapus ${item.name} dari tas`);
		remove.textContent = 'Hapus';

		row.append(image, details, remove);
		bagItems.append(row);
	});
};

const openProductDetail = (trigger) => {
	const card = trigger.closest('.product-item');
	const image = card?.querySelector('.product-art img');
	const name = card?.querySelector('.product-name')?.textContent?.trim();
	const category = card?.closest('.menu-mode')?.querySelector('h3')?.textContent?.trim();
	if (!image || !name || !category || !productDetailShell || !productDetailDialog) return;

	selectedProduct = { name, image: image.getAttribute('src') };
	productDetailReturnFocus = trigger;
	productDetailImage.src = selectedProduct.image;
	productDetailImage.alt = name;
	productDetailName.textContent = name;
	productDetailCategory.textContent = category;
	productDetailShell.classList.add('is-open');
	productDetailShell.setAttribute('aria-hidden', 'false');
	document.body.classList.add('product-detail-open');
	productDetailDialog.focus();
};

const closeProductDetail = (restoreFocus = true) => {
	if (!productDetailShell) return;
	productDetailShell.classList.remove('is-open');
	productDetailShell.setAttribute('aria-hidden', 'true');
	document.body.classList.remove('product-detail-open');
	selectedProduct = null;
	if (restoreFocus) productDetailReturnFocus?.focus();
};

const openBag = (returnFocus) => {
	if (!bagShell || !bagDrawer) return;
	bagReturnFocus = returnFocus || bagTrigger;
	bagShell.classList.add('is-open');
	bagShell.setAttribute('aria-hidden', 'false');
	bagTrigger?.setAttribute('aria-expanded', 'true');
	document.body.classList.add('bag-open');
	bagDrawer.focus();
};

const closeBag = () => {
	if (!bagShell) return;
	bagShell.classList.remove('is-open');
	bagShell.setAttribute('aria-hidden', 'true');
	bagTrigger?.setAttribute('aria-expanded', 'false');
	document.body.classList.remove('bag-open');
	bagReturnFocus?.focus();
};

bagTrigger?.addEventListener('click', () => openBag(bagTrigger));

document.querySelectorAll('[data-product-detail]').forEach((button) => {
	button.addEventListener('click', () => openProductDetail(button));
});

productDetailAdd?.addEventListener('click', () => {
	if (!selectedProduct) return;
	const current = bag.get(selectedProduct.image);
	bag.set(selectedProduct.image, {
		...selectedProduct,
		quantity: (current?.quantity || 0) + 1
	});
	renderBag();
	const returnFocus = productDetailReturnFocus;
	closeProductDetail(false);
	openBag(returnFocus);
});

document.querySelectorAll('.add-to-bag').forEach((button) => {
	button.addEventListener('click', () => {
		const card = button.closest('.product-item');
		const image = card?.querySelector('.product-art img');
		const name = card?.querySelector('.product-name')?.textContent?.trim();
		if (!image || !name) return;

		const key = image.getAttribute('src');
		const current = bag.get(key);
		bag.set(key, {
			name,
			image: key,
			quantity: (current?.quantity || 0) + 1
		});
		renderBag();
		openBag(button);
	});
});

bagItems?.addEventListener('click', (event) => {
	const removeButton = event.target.closest('[data-remove-item]');
	if (!removeButton) return;
	bag.delete(removeButton.dataset.removeItem);
	renderBag();
});

document.querySelectorAll('[data-close-bag]').forEach((button) => {
	button.addEventListener('click', closeBag);
});

document.querySelectorAll('[data-close-product-detail]').forEach((button) => {
	button.addEventListener('click', closeProductDetail);
});

document.addEventListener('keydown', (event) => {
	if (event.key !== 'Escape') return;
	if (productDetailShell?.classList.contains('is-open')) return closeProductDetail();
	if (bagShell?.classList.contains('is-open')) closeBag();
});

renderBag();

const commentForm = document.querySelector('#comment-form');
const commentNameInput = document.querySelector('#comment-name');
const commentMessageInput = document.querySelector('#comment-message');
const commentList = document.querySelector('#comment-list');
const commentStatus = document.querySelector('#comment-status');
const commentStorageKey = 'ashashopp-comments';
const sampleComments = [
	{
		name: 'ica',
		role: 'Pelajar',
		rating: 5,
		avatar: 'assets/img/customers/model 1.jpg',
		message: 'tahu yang sangat mangtap, dagingnya yang full n montok moy! terus rasanya yang pas (tidak keasinan/hambar) sangat worth it 4k/pcs dapet taso seebak ini🥺🥺 ayok join sebagai taso loversnya kak ipeng! dijamin ketagihan🤭😉🥺😚'
	},
	{
		name: 'Alifa',
		role: 'Mahasiswi',
		rating: 5,
		avatar: 'assets/img/customers/model 2.jpg',
		message: 'Ukurannya besar, isian baksonya padat dan berasa daging asli bukan tepung doang. Teksturnya kenyal, tahu luarnya lembut, dan rasanya pas bahkan tanpa saus. Tapi kalian bisa req mau pedas atau engga, kalo pedes pedes bgt. Kalo Kalian minta ga pedes, nanti bakal dikasih saos yang enak bgt! saus nya type aku bgt hwhwhw. Dengan harga Rp4.000, ini jelas lebih dari sekedar jajanan ini comfort food yang layak dilirik. Cocok buat camilan sore atau lauk tambahan. Worth it? Banget'
	},
	{
		name: 'Radha',
		role: 'Mahasiswi',
		rating: 5,
		avatar: 'assets/img/customers/model 3.jpg',
		message: 'fahh, ini enaakkk bnarr plus berdaging lalu mnaa enaakk pedas😭, lahap bnar ak mkan bdua wk, saos ny enakkkk juga hiksss, kna next order ae lgii wkk, pedasss mntapp'
	},
	{
		name: 'Suci',
		role: 'Pelajar',
		rating: 5,
		avatar: 'assets/img/customers/model 4.jpg',
		message: 'ashaa tasonya enakk batt😍 berdaging, mna hrgnya 4k aja satunya worth it parahhh'
	}
];

const loadComments = () => {
	let savedComments;
	try {
		savedComments = JSON.parse(window.localStorage.getItem(commentStorageKey) || '[]');
	} catch {
		return [];
	}
	if (!Array.isArray(savedComments)) return [];

	const validComments = savedComments.filter((comment) => typeof comment?.name === 'string' && typeof comment?.message === 'string');
	const remainingComments = validComments.filter((comment) => {
		const isRequestedComment = comment.name.trim().toLowerCase() === 'jaka'
			&& comment.message.trim().toLowerCase() === 'ipeh cantik banget';
		return !isRequestedComment;
	});

	if (remainingComments.length !== validComments.length) {
		try {
			window.localStorage.setItem(commentStorageKey, JSON.stringify(remainingComments));
		} catch {}
	}
	return remainingComments.slice(0, 100);
};

let comments = loadComments();

const renderComments = () => {
	if (!commentList) return;
	commentList.replaceChildren();
	const visibleComments = [...comments, ...sampleComments];

	if (visibleComments.length === 0) {
		const emptyMessage = document.createElement('p');
		emptyMessage.className = 'comment-empty';
		emptyMessage.textContent = 'Belum ada komentar.';
		commentList.append(emptyMessage);
		return;
	}

	visibleComments.forEach((comment) => {
		const item = document.createElement('article');
		item.className = 'comment-item';

		if (Number.isInteger(comment.rating) && comment.rating > 0) {
			const rating = document.createElement('div');
			rating.className = 'comment-rating';
			rating.setAttribute('role', 'img');
			rating.setAttribute('aria-label', `${comment.rating} dari 5 bintang`);
			rating.textContent = '★'.repeat(Math.min(comment.rating, 5));
			item.append(rating);
		}

		const message = document.createElement('p');
		message.textContent = comment.message;

		const footer = document.createElement('div');
		footer.className = 'comment-item__footer';
		const avatar = document.createElement('img');
		avatar.className = 'comment-avatar';
		avatar.alt = '';
		if (comment.avatar) {
			avatar.src = comment.avatar;
		} else {
			avatar.classList.add('comment-avatar--initial');
			avatar.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#d8d6ce"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#47463f">${comment.name.trim().charAt(0).toUpperCase()}</text></svg>`)}`;
		}

		const identity = document.createElement('div');
		identity.className = 'comment-identity';
		const name = document.createElement('h3');
		name.textContent = comment.name;
		const role = document.createElement('span');
		role.textContent = comment.role || 'Pelanggan';
		identity.append(name, role);
		footer.append(avatar, identity);

		const date = new Date(comment.createdAt);
		if (!Number.isNaN(date.getTime())) {
			const timestamp = document.createElement('time');
			timestamp.className = 'comment-timestamp';
			timestamp.dateTime = date.toISOString();
			timestamp.textContent = new Intl.DateTimeFormat('id-ID', {
				dateStyle: 'medium',
				timeStyle: 'short'
			}).format(date);
			footer.append(timestamp);
		}

		item.append(message, footer);
		commentList.append(item);
	});
};

commentForm?.addEventListener('submit', (event) => {
	event.preventDefault();
	const name = commentNameInput.value.trim();
	const message = commentMessageInput.value.trim();
	if (!name || !message) return;

	comments.unshift({ name, message, createdAt: new Date().toISOString() });
	comments = comments.slice(0, 100);
	let saved = true;
	try {
		window.localStorage.setItem(commentStorageKey, JSON.stringify(comments));
	} catch {
		saved = false;
	}
	commentForm.reset();
	commentStatus.textContent = saved ? 'Komentar berhasil ditambahkan.' : 'Komentar ditambahkan untuk sesi ini.';
	renderComments();
});

renderComments();

const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');

contactForm?.addEventListener('submit', (event) => {
	event.preventDefault();
	const formData = new FormData(contactForm);
	const contactMessage = [
		'Halo AshaShopp, saya ingin menghubungi.',
		`Nama: ${formData.get('name')}`,
		`Email: ${formData.get('email')}`,
		`No. Handphone: ${formData.get('phone')}`
	].join('\n');
	const contactUrl = new URL('https://wa.me/6285817775978');
	contactUrl.searchParams.set('text', contactMessage);
	window.open(contactUrl.toString(), '_blank', 'noopener,noreferrer');
	contactStatus.textContent = 'WhatsApp dibuka dengan pesan kontak Anda.';
});
