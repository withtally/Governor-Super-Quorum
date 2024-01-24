import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { Factory, MyToken } from '../../typechain-types'; // Adjust the path according to your project structure



describe('Factory Contract Tests', () => {
    let factory: Factory;
    let signers: Signer[];
    let admin: Signer;
    let updater: Signer;
    let implementationAddress: string;
    let implementation2Address: string;

    // Fixture to deploy the contract and set initial state
    async function deployFactoryFixture() {
        signers = await ethers.getSigners();
        [admin, updater] = signers;

        const FactoryContract = await ethers.getContractFactory('Factory');
        factory = await FactoryContract.deploy() as Factory;

        // Deploy a mock implementation contract and set it in the factory
        const ImplementationContract = await ethers.getContractFactory('MyToken');
        const implementation = await ImplementationContract.deploy(admin.address);
        const implementation2 = await ImplementationContract.deploy(admin.address);

        implementationAddress = await implementation.getAddress();
        implementation2Address = await implementation2.getAddress();

        await factory.initialize(implementationAddress, await updater.getAddress());

        return { factory, implementation, implementation2, admin, updater };
    }


    beforeEach(async () => {
        const { factory, implementation, admin, updater, implementation2 } = await deployFactoryFixture();

    });

    it('should deploy clone', async () => {
        await expect(factory.connect(updater).updateImplementation(implementation2Address))
            .to.emit(factory, 'ImplementationStored')
            .withArgs(implementation2Address);

        expect(await factory.implementation()).to.equal(implementation2Address);
    });

    it('should emit ImplementationStored event with correct address', async () => {
        const { factory, admin } = await deployFactoryFixture();
    
        // Trigger the event
        const tx = await factory.connect(updater).updateImplementation(implementation2Address);
        await tx.wait();
    
        // Retrieve the event
        const events = await factory.queryFilter(factory.filters.ImplementationStored());
        
        // Check if the event is present and has the correct argument
        expect(events).to.not.be.empty;
        const event = events[events.length - 1];
        expect(event.args.implementation).to.equal(implementation2Address);
      });

    
    it('should update implementation address', async () => {
        const newImplementationAddress = "0x70ebAD30a31657A9cF7A748269C2FB0E63C2E4B7";
        await expect(factory.connect(updater).updateImplementation(newImplementationAddress))
            .to.emit(factory, 'ImplementationStored')
            .withArgs(newImplementationAddress);

        expect(await factory.implementation()).to.equal(newImplementationAddress);
    });

    // ... (more tests)


});
