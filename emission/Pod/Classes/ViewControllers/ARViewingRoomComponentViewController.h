#import "ARComponentViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface ARViewingRoomComponentViewController : ARComponentViewController

- (instancetype)initWithViewingRoomID:(NSString *)viewingRoomID;

- (instancetype)initWithViewingRoomID:(NSString *)viewingRoomID
                             emission:(nullable AREmission *)emission NS_DESIGNATED_INITIALIZER;

- (instancetype)initWithEmission:(nullable AREmission *)emission
                      moduleName:(NSString *)moduleName
               initialProperties:(nullable NSDictionary *)initialProperties NS_UNAVAILABLE;
@end

NS_ASSUME_NONNULL_END
