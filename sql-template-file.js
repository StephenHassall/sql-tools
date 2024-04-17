/**
 * SQL Template File
 * Used for loading in SQL templates.
 */
export class SqlTemplateFile {
    /**
     * Template map. The cache of templates
     */
    static _templateCache = new Map();

    /**
     * Get a template that is stored within a SQL file that has the given name. There need to be a "#template [name]...#endtemplate" in the file.
     * @param {String} name The name of the template. This is used to search for the template within the file.
     * @param {String} file Either the full path to the file or (if importMetaUrl is used) the relative path to the file.
     * @param {String} importMetaUrl The location of the module that is calling the function. This is used when working with relative paths.
     * @param {Boolean} [cache=true] Is the template cached so that it does not need to be read from the file next time.
     * @return {Promise} A promise that resolves the SQL template.
     */
    static async getTemplateByName(name, file, importMetaUrl, cache) {
        // Check cache default value
        if (cache === undefined) cache = true;

        // Set full path
        let fullPath = file;

        // If using relative path
        if (importMetaUrl) {
            // Get calling file path
            const callingFile = fileURLToPath(importMetaUrl);

            // Get calling folder location
            const callingFolder = Path.dirname(callingFile);

            // Set the relative full path
            fullPath = Path.join(callingFolder, file);
        }

        // Set cache key
        let cacheKey;

        // If cache being used
        if (cache === true) {
            // Set cache key
            cacheKey = importMetaUrl + '-' + file + '-' + name;

            // If the template in the cache
            if (SqlTools._templateCache.has(cacheKey) === true) {
                // Get the cached template
                const template = Sql._templateCache.get(cacheKey);

                // Return a promise that resolves the template
                return Promise.resolve(template);
            }
        }

        // Get file data
        const fileData = await readFile(fullPath, { encoding: 'utf8' });

        // Set the text to search for
        const searchTemplate = '#template ' + name;

        // Look for text
        let startIndex = fileData.indexOf(searchTemplate);

        // If not found
        if (startIndex === -1) {
            // Return a rejected promise
            return Promise.reject('Template not found');
        }

        // Look for end of template
        let endIndex = fileData.indexOf('#endtemplate', startIndex);

        // If not found
        if (endIndex === -1) {
            // Return a rejected promise
            return Promise.reject('Missing endtemplate');
        }

        // Adjust start of index
        startIndex += searchTemplate.length;

        // Check LF CR characters at the start
        if (fileData.charAt(startIndex) === '\n' || fileData.charAt(startIndex) === '\r') startIndex++;
        if (fileData.charAt(startIndex) === '\n' || fileData.charAt(startIndex) === '\r') startIndex++;

        // Check LF CR characters at the end
        if (fileData.charAt(endIndex - 1) === '\n' || fileData.charAt(endIndex - 1) === '\r') endIndex--;
        if (fileData.charAt(endIndex - 1) === '\n' || fileData.charAt(endIndex - 1) === '\r') endIndex--;

        // Get the template
        const template = fileData.substring(startIndex, endIndex);

        // If cache being used
        if (cache === true) {
            // Add the template to the cache
            SqlTools._templateCache.set(cacheKey, template);
        }

        // Return a promise with the resolved template
        return Promise.resolve(template);
    }

    /**
     * Get a SQL template from a file (or cache).
     * @param {String} file Either the full path to the file or (if importMetaUrl is used) the relative path to the file.
     * @param {String} importMetaUrl The location of the module that is calling the function. This is used when working with relative paths.
     * @param {Boolean} [cache=true] Is the SQL template cached so that it does not need to be read from the file next time.
     * @return {Promise} A promise that resolves the SQL template.
     */
    static async getTemplate(file, importMetaUrl, cache) {
        // Check cache default value
        if (cache === undefined) cache = true;

        // Set full path
        let fullPath = file;

        // If using relative path
        if (importMetaUrl) {
            // Get calling file path
            const callingFile = fileURLToPath(importMetaUrl);

            // Get calling folder location
            const callingFolder = Path.dirname(callingFile);

            // Set the relative full path
            fullPath = Path.join(callingFolder, file);
        }

        // If cache being used
        if (cache === true) {
            // If the template is in the cache
            if (SqlTools._templateCache.has(fullPath) === true) {
                // Get the cached template
                const template = SqlTools._templateCache.get(fullPath);

                // Return a promise that resolves the template
                return Promise.resolve(template);
            }
        }

        // Get template file data
        const template = await readFile(fullPath, { encoding: 'utf8' });

        // If cache being used
        if (cache === true) {
            // Add the template to the cache
            SqlTools._templateCache.set(fullPath, template);
        }

        // Return a promise with the resolved template
        return Promise.resolve(template);
    }
}