const { execSync } = require('child_process')

const timestamp = () => {
	const lastDate = new Date()
	const date = Math.floor(lastDate.getTime() / 1000)
	const time = lastDate.getTime() * 1000000

	return { date, time }
}

const taskkill = processName => {
	try {
		return execSync(`taskkill /F /IM ${processName}`, { encoding: 'utf-8' })
	}

	catch(error) {
		return { error }
	}
}

const flusshDNS = () => {
	try {
		return execSync(`ipconfig /release&ipconfig /flushdns&ipconfig /renew&ipconfig /flushdns`, { encoding: 'utf-8' })
	}

	catch(error) {
		return { error }
	}
}

const rand = (length) => {
	let hex = '0123456789abcdef'
	let result = ''

	for(let i = 0; i < length; i++) {
		result = result + hex.charAt(Math.floor(Math.random() * hex.length))
	}

	return result
}

class Reg {
	#lastKey = ''
	#createList = []
	#readList = []
	#writeList = []
	#deleteList = []
	#error = false

	#readingResult = ''	
	get readingResult() {
		return this.#readingResult
	}

	#writingResult = ''
	get writingResult() {
		return this.#writingResult
	}

	prepare(key) {
		if (this.#error) return this

		this.#lastKey = key
		return this
	}

	clearCreationList() {
		this.#createList = []
		return this
	}

	clearReadingList() {
		this.#readList = []
		return this
	}

	clearWritingList() {
		this.#writeList = []
		return this
	}

	clearDeletionList() {
		this.#deleteList = []
		return this
	}

	addToCreationList() {
		if (this.#error) return this

		this.#createList.push(`reg add "${this.#lastKey}" /F`)
		return this
	}

	addToReadingList(name) {
		if (this.#error) return this

		this.#readList.push(`reg query "${this.#lastKey}" /v ${name}`)
		return this
	}

	addToWritingList(name, type, value) {
		if (this.#error) return this

		this.#writeList.push(`reg add "${this.#lastKey}" /v ${name} /t ${type} /d "${value}" /F`)
		return this
	}

	addToDeleteList(name) {
		if (this.#error) return this
		this.#deleteList.push(name ? `reg delete "${this.#lastKey}" /v ${name} /F` : `reg delete "${this.#lastKey}" /F`)
		return this
	}

	#addResultToList(typeList, result) {
		if (this.#error) return this

		result.trim().split('\n\n\n').forEach(info => {
			const [ key, values ] = info.split('\n')

			if (!values) {
				if (typeList == 'create') this.#createList.push(`reg add "${key}" /F`)
				if (typeList == 'delete') this.#createList.push(`reg delete "${key}" /F`)
				return
			}

			const [name, type, value] = values.trim().split(/\s{1,8}/)

			if (typeList == 'read') this.#readList.push(`reg query "${key}" /v ${name}`)
			if (typeList == 'write') this.#writeList.push(`reg add "${key}" /v ${name} /t ${type} /d "${value}" /F`)
			if (typeList == 'delete') this.#createList.push(`reg delete "${key}" /v ${name} /F`)
		})
	}

	addResultToCreationList(result) {
		this.#addResultToList('create', result)
		return this
	}

	addResultToReadingList(result) {
		this.#addResultToList('read', result)
		return this
	}

	addResultToWritingList(result) {
		this.#addResultToList('write', result)
		return this
	}

	addResultToDeletionnList(result) {
		this.#addResultToList('delete', result)
		return this
	}

	#runCommand(command) {
		if (this.#error) return this

		try {
			return execSync(command, { encoding: 'utf-8' })
		}

		catch(error) {
			this.#error = error
		}
	}

	runCreationList() {
		this.#runCommand(this.#createList.join('&'))

		this.clearCreationList()
		return this
	}

	runReadingList() {
		this.#readingResult = this.#runCommand(this.#readList.join('&'))

		this.clearReadingList()
		return this
	}

	runWritingList() {
		this.#runCommand(this.#writeList.join('&'))

		const replaceReg = write => write.replace(/reg add "(.*)" \/v (.*) \/t (REG_.*) \/d "(.*)" \/F/g, '\r\n$1\r\n    $2   $3   $4\r\n')
		this.#writingResult = this.#writeList.map(replaceReg).join('\r\n') + '\r\n'

		this.clearWritingList()
		return this
	}

	runDeletionList() {
		this.#runCommand(this.#deleteList.join('&'))

		this.clearDeletionList()
		return this
	}

	trackErros(callback) {
		if (this.#error) callback(this.#error)
		return this
	}
}

module.exports = { Reg, rand, timestamp, taskkill, flusshDNS }