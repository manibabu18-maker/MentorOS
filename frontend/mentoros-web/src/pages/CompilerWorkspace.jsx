function CompilerWorkspace() {
  return (
    <main className="compiler-page">
      <div className="compiler-layout">

        <section className="problem-panel">
          <h2>Problem Statement</h2>
          <h3>Hello World</h3>
          <p>Write a C program to print Hello World.</p>

          <div className="sample-box">
            <strong>Expected Output</strong>
            <pre>Hello World</pre>
          </div>
        </section>

        <section className="editor-panel">
          <h2>Code Editor</h2>

          <textarea
            className="code-editor"
            defaultValue={`#include <stdio.h>

int main() {

    return 0;
}`}
          />

          <div className="action-buttons">
            <button className="run-btn">Run</button>
            <button className="submit-btn">Submit</button>
            <button className="hint-btn">Hint</button>
          </div>
        </section>

        <aside className="right-panel">
          <div className="test-panel">
            <h3>Test Cases</h3>
            <p>Visible: 1</p>
            <p>Hidden: 3</p>
          </div>

          <div className="output-panel">
            <h3>Output</h3>
            <pre>Your output will appear here...</pre>
          </div>
        </aside>

      </div>
    </main>
  );
}

export default CompilerWorkspace;