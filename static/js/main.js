// static/js/main.js

const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "bytes32", "name": "_fileHash", "type": "bytes32" },
            { "internalType": "string", "name": "_filename", "type": "string" },
            { "internalType": "string", "name": "_message", "type": "string" }
        ],
        "name": "notarize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const CONTRACT_ADDRESS = "0x22e31763b96a20390aEeAEA2647952Fe6c2EE8F7";

// Check connectivity on load
window.addEventListener('load', () => {
    const mmStatus = document.getElementById('mm-check');
    if (typeof window.ethereum !== 'undefined') {
        mmStatus.innerText = "Connected ✅";
        mmStatus.style.color = "green";
    } else {
        mmStatus.innerText = "Missing ❌";
        mmStatus.style.color = "red";
    }
});

async function processAndSign() {
    const fileInput = document.getElementById('fileInput');
    const message = document.getElementById('message').value;
    const status = document.getElementById('status');

    if (!fileInput.files[0]) return alert("Please select a file.");

    try {
        status.className = "";
        status.innerText = "Step 1: Hashing file via Flask...";

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        const response = await fetch('/generate_hash', { method: 'POST', body: formData });
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);

        const fileHash = data.hash;
        const fileName = data.filename;

        status.innerText = "Step 2: Opening MetaMask...";

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        status.innerText = "Step 3: Please confirm in MetaMask...";
        const tx = await contract.notarize(fileHash, fileName, message);
        
        status.innerText = "Step 4: Transaction pending on Routescan...";
        await tx.wait();

        status.className = "success";
        status.innerHTML = `
            <strong>Success!</strong><br>
            File Hash: ${fileHash}<br>
            <a href="https://testnet.routescan.io/tx/${tx.hash}" target="_blank">View on Routescan</a>
        `;

    } catch (err) {
        console.error(err);
        status.className = "error";
        status.innerText = "Error: " + (err.reason || err.message || "Transaction Rejected");
    }
}