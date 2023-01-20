<template>
	<div class="h-full flex">
		<div class="flex-grow" />
		<div>
			<div class="pt-10 text-3xl text-center">
				wiwiblob
			</div>
			<div class="h-24" />
			<form method="post" action="/api/upload/public-file" class="border-2 border-purple-500 rounded-lg">
				<input
					ref="input"
					type="file"
					name="files"
					class="m-7 p-1"
					multiple
					required
				>
				<input
					type="submit"
					value="Upload"
					formenctype="multipart/form-data"
					class="
						mr-6 px-4 py-2
						border border-purple-300 rounded-md
						hover:bg-purple-200 hover:border-purple-500 active:bg-purple-300 transition-colors
						cursor-pointer
					"
				>
			</form>
		</div>
		<div class="flex-grow" />
	</div>
</template>
