<template>
	<div class="h-full flex">
		<div class="flex-grow" />
		<div>
			<div class="pt-10 text-3xl text-center">
				wiwiblob
			</div>
			<div class="h-24" />
			<form method="post" action="/api/upload/public-file">
				<input ref="input" type="file" name="files" multiple>
				<br>
				<input type="submit" value="Upload" formenctype="multipart/form-data">
			</form>
		</div>
		<div class="flex-grow" />
	</div>
</template>
