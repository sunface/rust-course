# panic!


## panic背后的原理

Not sure exactly what you're asking, but I'll try to describe the panic mechanism as I understand it. I'm sure folks will correct my mistakes.
When you call the panic!() macro it formats the panic message and then calls std::panic::panic_any() with the message as the argument. panic_any() first checks to see if there's a "panic hook" installed by the application: if so, the hook function is called. Assuming that the hook function returns, the unwinding of the current thread begins with the parent stack frame of the caller of panic_any(). If the registers or the stack are messed up, likely trying to start unwinding will cause an exception of some kind, at which point the thread will be aborted instead of unwinding.
Unwinding is a process of walking back up the stack, frame-by-frame. At each frame, any data owned by the frame is dropped. (I believe things are dropped in reverse static order, as they would be at the end of a function.)
One exceptional case during unwinding is that the unwinding may hit a frame marked as "catching" the unwind via std::panic::catch_unwind(). If so, the supplied catch function is called and unwinding ceases: the catching frame may continue the unwinding with std::panic::resume_unwind() or not.
Another exceptional case during unwinding is that some drop may itself panic. In this case the unwinding thread is aborted.
Once unwinding of a thread is aborted or completed (no more frames to unwind), the outcome depends on which thread panicked. For the main thread, the operating environment's abort functionality is invoked to terminate the panicking process via core::intrinsics::abort(). Child threads, on the other hand, are simply terminated and can be collected later with std::thread::join()