import {expect} from 'chai';
import {BuildQueryString} from '../../src';

describe('Common', () => {
    describe('BuildQueryString', () => {
        it('should build query string with simple key-value pairs', () => {
            // Arrange
            const params = {
                foo: 'bar',
                name: 'test',
            };

            // Act
            const result = BuildQueryString(params);

            // Assert
            expect(result).to.equal('foo=bar&name=test');
        });

        it('should filter out null values', () => {
            // Arrange
            const params = {
                foo: 'bar',
                nullValue: null,
                name: 'test',
            };

            // Act
            const result = BuildQueryString<{foo: string}>(params);

            // Assert
            expect(result).to.equal('foo=bar&name=test');
        });

        it('should filter out undefined values', () => {
            // Arrange
            const params = {
                foo: 'bar',
                undefinedValue: undefined,
                name: 'test',
            };

            // Act
            const result = BuildQueryString(params);

            // Assert
            expect(result).to.equal('foo=bar&name=test');
        });

        it('should convert numbers to strings', () => {
            // Arrange
            const params = {
                id: 123,
                price: 45.67,
                count: 0,
            };

            // Act
            const result = BuildQueryString(params);

            // Assert
            expect(result).to.equal('id=123&price=45.67&count=0');
        });

        it('should convert booleans to strings', () => {
            // Arrange
            const params = {
                active: true,
                deleted: false,
            };

            // Act
            const result = BuildQueryString(params);

            // Assert
            expect(result).to.equal('active=true&deleted=false');
        });

        it('should handle empty object', () => {
            let params = undefined;
            let result = BuildQueryString<void>(params);
            expect(result).to.equal('');

            params = null;
            result = BuildQueryString<any>(params);
            expect(result).to.equal('');

            params = {};
            result = BuildQueryString(params);
            expect(result).to.equal('');
        });

        it('should URL encode special characters', () => {
            // Arrange
            const params = {
                email: 'test@example.com',
                message: 'Hello World!',
                url: 'https://example.com/path?query=value',
            };

            // Act
            const result = BuildQueryString(params);

            // Assert
            expect(result).to.equal(
                'email=test%40example.com&message=Hello+World%21&url=https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue'
            );
        });

        it('should handle mixed types with null and undefined', () => {
            // Arrange
            const params = {
                str: 'hello',
                num: 42,
                bool: true,
                nullVal: null,
                undefVal: undefined,
                zero: 0,
                emptyStr: '',
            };

            // Act
            const result = BuildQueryString(params);

            // Assert
            expect(result).to.equal('str=hello&num=42&bool=true&zero=0&emptyStr=');
        });

        it('should handle array conversion', () => {
            // Arrange
            const params = {
                tags: ['tag1', 'tag2'],
                ids: [1, 2, 3],
            };

            // Act
            const result = BuildQueryString(params);

            // Assert
            expect(result).to.equal('tags=tag1%2Ctag2&ids=1%2C2%2C3');
        });

        it('should handle object conversion', () => {
            // Arrange
            const params = {
                filter: {name: 'test', value: 123},
            };

            // Act
            const result = BuildQueryString(params);

            // Assert
            expect(result).to.equal('filter=%5Bobject+Object%5D');
        });
    });
});
