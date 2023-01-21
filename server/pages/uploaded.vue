<template>
	<div>
		<template v-if="Array.isArray(good)">
			<h1 class="pt-10 text-3xl text-center">
				success!
			</h1>
			<br><br>
			<div class="border-2 border-purple-500 rounded-lg p-8 text-center">
				{{ good.length === 1 ? "link to download" : "links to downloads" }} (right click and choose "copy link"):<br>
				<template v-for="file in good">
					<nuxt-link
						:to="file.link"
						class="text-purple-500 underline hover:text-purple-700"
					>
						{{ file.filename || "<no name>" }}
					</nuxt-link>
					(<nuxt-link
						:to="file.link + '?view'"
						class="text-purple-500 underline hover:text-purple-700"
						title="Only works if browser supports the file format"
					>
						view in browser
					</nuxt-link>)
					<br>
				</template>
			</div>
			<br>
			<div class="flex flex-row">
				<div class="flex-grow" />
				<nuxt-link
					to="/"
					class="
						block
						px-4 py-2
						border border-purple-300 rounded-md
						hover:bg-purple-200 hover:border-purple-500 active:bg-purple-300 transition-colors
						cursor-pointer
					"
				>
					go home
				</nuxt-link>
				<div class="flex-grow" />
			</div>
		</template>
		<template v-else-if="good === 'go home'">
			<h1 class="pt-10 text-3xl text-center">
				looking to go home?
			</h1>
			<br>
			<div class="flex flex-row">
				<div class="flex-grow" />
				<nuxt-link
					to="/"
					class="
						block
						px-4 py-2
						border border-purple-300 rounded-md
						hover:bg-purple-200 hover:border-purple-500 active:bg-purple-300 transition-colors
						cursor-pointer
					"
				>
					yes
				</nuxt-link>
				<div class="flex-grow" />
			</div>
		</template>
		<template v-else-if="good === 'invalid hashes'">
			<h1 class="pt-10 text-3xl text-center">
				invalid hashes
			</h1>
			<br>
			<div class="flex flex-row">
				<div class="flex-grow" />
				<nuxt-link
					to="/"
					class="
						block
						px-4 py-2
						border border-purple-300 rounded-md
						hover:bg-purple-200 hover:border-purple-500 active:bg-purple-300 transition-colors
						cursor-pointer
					"
				>
					go home
				</nuxt-link>
				<div class="flex-grow" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
	let good = ref<"not ready" | Array<{ filename: string, link: string }> | "go home" | "invalid hashes">("not ready");

	let route = useRoute();
	let questionmark = route.fullPath.indexOf("?");
	if (questionmark < 0) good.value == "go home";
	let urlparams = new URLSearchParams(route.fullPath.substring(questionmark));
	let files_param = urlparams.get("files");

	if (!files_param) {
		good.value = "go home";
	} else {
		files_param = decodeURIComponent(files_param);
		let files = files_param.split(";").map(f => {
			let colon = f.lastIndexOf(":");
			let filename = f.substring(0, colon);
			let hash = f.substring(colon + 1);
			return { filename, hash };
		});

		if (!files.every(f => f.hash.length === 64)) {
			good.value = "invalid hashes";
		} else {
			let config = useRuntimeConfig();
			good.value = files.map(f => ({
				filename: f.filename,
				link: `${config.host}${config.baseURL}api/download/${f.hash}`
			}));
		}
	}
</script>
