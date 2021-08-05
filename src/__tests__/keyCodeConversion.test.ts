jest.setTimeout(300000)

async function getKeyForCode(code: string): Promise<string> {
	return await page.evaluate<string>(`sorensen.getKeyForCode(${JSON.stringify(code)})`)
}

describe('Sørensen.getKeyForCode', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:9000/index.html')
		await page.waitForTimeout(300)
	})

	// these tests assume running on an US-English machine

	it('converts "KeyW" to "w"', async () => {
		const result = await getKeyForCode('KeyW')
		expect(result).toBe('w')
	})

	it('converts "Enter" to "Enter"', async () => {
		const result = await getKeyForCode('Enter')
		expect(result).toBe('Enter')
	})
})
