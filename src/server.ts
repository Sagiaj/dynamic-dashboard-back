import ApplicationBootstrap from './config/bootstrap';

ApplicationBootstrap.up().then(bootstrappedApp => {
    const server = bootstrappedApp.listen(Globals.SERVER_PORT, () => {
        console.log(`Success! Server running on port ${Globals.SERVER_PORT}`);
    });
});
