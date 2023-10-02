const { Reg, rand, timestamp, taskkill, flusshDNS } = require('./core.js')
const { date, time } = timestamp()

const networkAddress = rand(12).toUpperCase()
const hwProfileGuid = `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`
const machineID = `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`.toUpperCase()
const machineGuid = `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`
const productId = `${rand(5)}-${rand(5)}-${rand(5)}-${rand(5)}`.toUpperCase()
const computerName = `N-${rand(15)}`.toUpperCase()

const regedit = `
HKLM\\SYSTEM\\CurrentControlSet\\Control\\WMI\\Restrictions
    HideMachine   REG_DWORD   1


HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e972-e325-11ce-bfc1-08002be10318}\\0005
    NetworkAddress   REG_SZ   ${networkAddress}


HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\IDConfigDB\\Hardware Profiles\\0001
    HwProfileGuid   REG_SZ   {${hwProfileGuid}}


HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\SQMClient
    MachineId   REG_SZ   {${machineID}}


HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography
    MachineGuid   REG_SZ   ${machineGuid}


HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion
    InstallDate   REG_DWORD   ${date}


HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion
    InstallTime   REG_QWORD   ${time}


HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion
    ProductId   REG_SZ   ${productId}


HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\ComputerName\\ActiveComputerName
    ComputerName   REG_SZ   ${computerName}

`

const reg = new Reg()
.addResultToCreationList(`HKLM\\SYSTEM\\CurrentControlSet\\Control\\WMI\\Restrictions`)
.addResultToReadingList(regedit)
.addResultToWritingList(regedit)

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