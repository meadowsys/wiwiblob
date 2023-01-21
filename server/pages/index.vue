<template>
	<div>
		<h1 class="pt-10 text-3xl text-center">
			wiwiblob
		</h1>
		<div class="h-24" />
		<form
			method="post"
			action="/api/upload/public-file?ui=true"
			enctype="multipart/form-data"
			class="border-2 border-purple-500 rounded-lg"
		>
			<input
				type="file"
				name="files"
				class="m-7 p-1"
				multiple
				required
			>
			<input
				type="submit"
				value="Upload"
				class="
					mr-6 px-4 py-2
					border border-purple-300 rounded-md
					hover:bg-purple-200 hover:border-purple-500 active:bg-purple-300 transition-colors
					cursor-pointer
				"
			>
		</form>
	</div>
</template>
