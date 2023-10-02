const { Reg, rand, timestamp, taskkill, flusshDNS } = require('./core.js')
const { date, time } = timestamp()

const reg = new Reg()
/*
.prepare('HKLM\\SYSTEM\\CurrentControlSet\\Control\\WMI\\ExampleKey')
.addToDeleteList('exampleValue')
.runDeletionList()
*/

// Hide SMBios
.prepare('HKLM\\SYSTEM\\CurrentControlSet\\Control\\WMI\\Restrictions')
.addToCreationList()
.addToWritingList('HideMachine', 'REG_DWORD', 1)

// Network Address
.prepare('HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e972-e325-11ce-bfc1-08002be10318}\\0005')
.addToReadingList('NetworkAddress')
.addToWritingList('NetworkAddress', 'REG_SZ', rand(12).toUpperCase())

// Hardware ID
.prepare('HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\IDConfigDB\\Hardware Profiles\\0001')
.addToReadingList('HwProfileGuid')
.addToWritingList('HwProfileGuid', 'REG_SZ', `{${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}}`)

// Machine ID
.prepare('HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\SQMClient')
.addToReadingList('MachineId')
.addToWritingList('MachineId', 'REG_SZ', `{${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}}`.toUpperCase())

// Machine Guid
.prepare('HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography')
.addToReadingList('MachineGuid')
.addToWritingList('MachineGuid',  'REG_SZ', `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`)

// Serial Machine
.prepare('HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion')
.addToReadingList('InstallDate')
.addToReadingList('InstallTime')
.addToReadingList('ProductId')
.addToWritingList('InstallDate', 'REG_DWORD', date)
.addToWritingList('InstallTime', 'REG_QWORD', time)
.addToWritingList('ProductId', 'REG_SZ', `${rand(5)}-${rand(5)}-${rand(5)}-${rand(5)}`.toUpperCase())

// Computer Name
.prepare('HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\ComputerName\\ActiveComputerName')
.addToReadingList('ComputerName')
.addToWritingList('ComputerName', 'REG_SZ', `N-${rand(15)}`.toUpperCase())

.runCreationList()
.runReadingList()
.runWritingList()

.trackErros(error => {
	console.log('err:', error)
})

console.log(reg.readingResult)
console.log(reg.writingResult)

// ## Hide SMBios	
const kill = taskkill('WmiPrvSE.exe')
if (!kill.error) console.log(kill)

// ## Flush DNS
const flush = flusshDNS()
if (!flush.error) console.log(flush)